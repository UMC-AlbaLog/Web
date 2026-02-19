import { useState, useMemo, useEffect } from 'react';
import type { ScheduleItem, DaySummary } from '../types/schedule';
import AddScheduleModal from '../components/schedule/AddScheduleModal';
import ScheduleEditModal from '../components/schedule/ScheduleEditModal';
import MonthlyView from '../components/schedule/MonthlyView';
import WeeklyView from '../components/schedule/WeeklyView';
import ScheduleSummarySidebar from '../components/schedule/ScheduleSummarySidebar';
import { getEstimatedSalaryForMonth } from '../utils/scheduleUtils';
import { useSchedules } from '../contexts/SchedulesContext';
import { getSchedules } from '../api/schedule';

const Schedule = () => {
  const { schedules, workplaces, setSchedules, setWorkplaces, addSchedule, updateSchedule, deleteSchedule } = useSchedules();

  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [weekStartDay, setWeekStartDay] = useState<'일요일' | '월요일'>('일요일');

  // 스케줄 화면 진입 시 + 보는 달 변경 시 해당 월 내 스케줄 조회 (내 데이터로 갱신)
  const visibleMonth = useMemo(
    () =>
      `${currentWeek.getFullYear()}-${String(currentWeek.getMonth() + 1).padStart(2, '0')}`,
    [currentWeek]
  );
  useEffect(() => {
    let cancelled = false;
    getSchedules({ month: visibleMonth })
      .then((list) => {
        if (!cancelled) setSchedules(list);
      })
      .catch(() => {
        // 실패 시 기존 목록 유지 (빈 배열로 덮어쓰지 않음 → 내가 등록한 일정이 사라지지 않게)
        if (import.meta.env.DEV) console.warn("[스케줄] 해당 월 조회 실패, 기존 데이터 유지");
      });
    return () => {
      cancelled = true;
    };
  }, [visibleMonth, setSchedules]);

  // 설정에서 주 시작 요일 불러오기
  useEffect(() => {
    const loadWorkEnvironment = () => {
      const saved = localStorage.getItem('workEnvironment');
      if (saved) {
        const env = JSON.parse(saved);
        if (env.weekStartDay === '일요일' || env.weekStartDay === '월요일') {
          setWeekStartDay(env.weekStartDay);
        }
      }
    };
    loadWorkEnvironment();

    // localStorage 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workEnvironment' && e.newValue) {
        const env = JSON.parse(e.newValue);
        if (env.weekStartDay === '일요일' || env.weekStartDay === '월요일') {
          setWeekStartDay(env.weekStartDay);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 주간 정보 가져오기 (설정에 따라 주 시작일 변경)
  const getWeekInfo = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    
    // 주 시작일 설정에 따라 조정
    let diff: number;
    if (weekStartDay === '월요일') {
      // 월요일이 주 시작일인 경우
      diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1); // 일요일이면 6일 전, 아니면 day-1일 전
    } else {
      // 일요일이 주 시작일인 경우 (기본값)
      diff = startOfWeek.getDate() - day;
    }
    
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return { startOfWeek, weekDays };
  };

  // 월간 정보 가져오기 (설정에 따라 주 시작일 변경)
  const getMonthInfo = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    
    // 주 시작일 설정에 따라 조정
    const firstDay = firstDayOfMonth.getDay();
    if (weekStartDay === '월요일') {
      // 월요일이 주 시작일인 경우
      const diff = firstDay === 0 ? 6 : firstDay - 1; // 일요일이면 6일 전, 아니면 firstDay-1일 전
      startDate.setDate(startDate.getDate() - diff);
    } else {
      // 일요일이 주 시작일인 경우 (기본값)
      startDate.setDate(startDate.getDate() - firstDay);
    }
    
    const endDate = new Date(lastDayOfMonth);
    const lastDay = lastDayOfMonth.getDay();
    if (weekStartDay === '월요일') {
      // 월요일이 주 시작일인 경우, 일요일까지 채우기
      const diff = lastDay === 0 ? 0 : 7 - lastDay; // 일요일이면 0일, 아니면 7-lastDay일 후
      endDate.setDate(endDate.getDate() + diff);
    } else {
      // 일요일이 주 시작일인 경우 (기본값)
      endDate.setDate(endDate.getDate() + (6 - lastDay));
    }
    
    const weeks = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return { year, month, weeks, firstDayOfMonth, lastDayOfMonth };
  };

  const { startOfWeek, weekDays } = useMemo(() => getWeekInfo(currentWeek), [currentWeek, weekStartDay]);
  const monthInfo = useMemo(() => getMonthInfo(currentWeek), [currentWeek, weekStartDay]);

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 해당 날짜의 스케줄 가져오기
  const getSchedulesForDate = (date: string) => {
    return schedules.filter(schedule => schedule.date === date);
  };

  // ID처럼 보이는 값(숫자만·긴 숫자)은 노출하지 않고 '근무처'로 통일 (재로그인 시 API가 id만 내려주는 경우 대비)
  const getDisplayWorkplaceName = (schedule: ScheduleItem): string => {
    const workplace = workplaces.find(w => w.id === schedule.workplaceId);
    if (workplace?.name) return workplace.name;
    const fallback = schedule.scheduleName || schedule.workplaceId || '';
    const looksLikeId = /^\d+$/.test(fallback) || (fallback.length >= 10 && /^[\w-]+$/.test(fallback));
    return looksLikeId ? '근무처' : (fallback || '알 수 없음');
  };

  // 특정 날짜의 알바 현황 요약 가져오기
  const getDaySummary = (date: string): DaySummary[] | null => {
    const daySchedules = getSchedulesForDate(date);
    if (daySchedules.length === 0) return null;

    const summaries = daySchedules.map(schedule => {
      const workplace = workplaces.find(w => w.id === schedule.workplaceId);
      return {
        workplaceName: getDisplayWorkplaceName(schedule),
        time: `${schedule.startTime} - ${schedule.endTime}`,
        color: workplace?.color || '#gray',
      };
    });

    return summaries;
  };

  // 이전/다음 주로 이동
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  // 빈 칸 클릭 시 새 일정 추가 모달
  const handleCellClick = (date: string, timeSlot: string) => {
    const daySchedules = getSchedulesForDate(date);
    const hasScheduleInSlot = daySchedules.some(schedule => {
      return schedule.startTime <= timeSlot && schedule.endTime > timeSlot;
    });

    if (!hasScheduleInSlot) {
      setShowAddModal(true);
    }
  };

  // 월간 뷰에서 날짜 더블클릭 시 일정 추가
  const handleMonthDayCellClick = (day: Date, e: React.MouseEvent) => {
    if (e.detail === 1) {
      setTimeout(() => {
        if (e.detail === 1) {
          setCurrentWeek(day);
          setViewMode('weekly');
        }
      }, 200);
    } else if (e.detail === 2) {
      e.stopPropagation();
      setShowAddModal(true);
    }
  };

  // 일정 추가 (반복 설정 적용)
  const handleAddSchedule = (schedule: ScheduleItem) => {
    const newSchedules: ScheduleItem[] = [schedule];

    // 반복 설정이 있는 경우 추가 일정 생성
    if (schedule.repeatType && schedule.repeatType !== 'none') {
      const baseDate = new Date(schedule.date);
      const endDate = new Date(baseDate);
      endDate.setMonth(endDate.getMonth() + 3); // 3개월치 일정 생성

      let currentDate = new Date(baseDate);

      if (schedule.repeatType === 'daily') {
        // 매일 반복
        currentDate.setDate(currentDate.getDate() + 1);
        while (currentDate <= endDate) {
          newSchedules.push({
            ...schedule,
            id: `${Date.now()}-${currentDate.getTime()}`,
            date: formatDate(currentDate),
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (schedule.repeatType === 'weekly') {
        // 매주 반복
        currentDate.setDate(currentDate.getDate() + 7);
        while (currentDate <= endDate) {
          newSchedules.push({
            ...schedule,
            id: `${Date.now()}-${currentDate.getTime()}`,
            date: formatDate(currentDate),
          });
          currentDate.setDate(currentDate.getDate() + 7);
        }
      } else if (schedule.repeatType === 'biweekly') {
        // 격주 반복
        currentDate.setDate(currentDate.getDate() + 14);
        while (currentDate <= endDate) {
          newSchedules.push({
            ...schedule,
            id: `${Date.now()}-${currentDate.getTime()}`,
            date: formatDate(currentDate),
          });
          currentDate.setDate(currentDate.getDate() + 14);
        }
      }
    }

    newSchedules.forEach((s) => addSchedule(s));
    setShowAddModal(false);
    // 서버 반영 후 해당 월 다시 조회해 목록 동기화 (새로고침/다른 달 갔다 와도 유지되도록)
    const month = `${currentWeek.getFullYear()}-${String(currentWeek.getMonth() + 1).padStart(2, '0')}`;
    setTimeout(() => {
      getSchedules({ month }).then((list) => setSchedules(list)).catch(() => {});
    }, 600);
  };

  // 일정 수정
  const handleEditSchedule = (updatedSchedule: ScheduleItem) => {
    updateSchedule(updatedSchedule.id, updatedSchedule);
    setEditingSchedule(null);
  };

  // 일정 삭제
  const handleDeleteSchedule = (scheduleId: string) => {
    deleteSchedule(scheduleId);
    setEditingSchedule(null);
  };

  // 시간대 배열 (6시부터 24시까지)
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 6;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  // 마우스 오버 핸들러
  const handleDayHover = (date: string, event: React.MouseEvent) => {
    const summary = getDaySummary(date);
    if (summary && summary.length > 0) {
      setHoveredDay(date);
      setHoverPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleDayLeave = () => {
    setHoveredDay(null);
    setHoverPosition(null);
  };

  const totalEstimatedSalary = useMemo(
    () =>
      getEstimatedSalaryForMonth(
        schedules,
        monthInfo.year,
        monthInfo.month + 1
      ),
    [schedules, monthInfo.year, monthInfo.month]
  );

  const monthScheduleCount = useMemo(() => {
    const prefix = `${monthInfo.year}-${String(monthInfo.month + 1).padStart(2, '0')}`;
    return schedules.filter((s) => s.date.startsWith(prefix) && s.scheduleType !== 'holiday').length;
  }, [schedules, monthInfo.year, monthInfo.month]);

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-50 min-w-0 overflow-hidden">
      {/* 메인: 내 스케줄 + 캘린더 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 헤더: 내 스케줄 + 월 네비 + 일정 추가 (작은 화면에서 줄바꿈) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 pb-4 sm:pb-6 shrink-0">
          <h1 className="text-xl font-bold text-gray-800 shrink-0">내 스케줄</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={
                  viewMode === 'monthly'
                    ? () => {
                        const newDate = new Date(currentWeek);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrentWeek(newDate);
                      }
                    : goToPreviousWeek
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              >
                ◀
              </button>
              <span className="text-base font-semibold text-gray-800 min-w-[140px] sm:min-w-[200px] text-center">
                | {viewMode === 'monthly'
                  ? `${monthInfo.year}년 ${monthInfo.month + 1}월`
                  : (() => {
                      const endOfWeek = new Date(startOfWeek);
                      endOfWeek.setDate(endOfWeek.getDate() + 6);
                      return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} ~ ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
                    })()}
              </span>
              <button
                onClick={
                  viewMode === 'monthly'
                    ? () => {
                        const newDate = new Date(currentWeek);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentWeek(newDate);
                      }
                    : goToNextWeek
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              >
                ▶
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  viewMode === 'monthly'
                    ? 'bg-gray-200 text-gray-800 font-medium'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                월
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  viewMode === 'weekly'
                    ? 'bg-gray-200 text-gray-800 font-medium'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                주
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-400 cursor-default"
                aria-label="목록 뷰 (준비 중)"
              >
                목록
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
            >
              <span className="text-base">+</span>
              근무 일정 추가
            </button>
          </div>
        </div>

        {/* 월 = 항상 월간 캘린더, 주 = 항상 주간 캘린더 */}
        {viewMode === 'monthly' ? (
          <>
            <div className="flex-1 px-4 sm:px-6 pt-2 pb-4 overflow-auto min-h-0 overflow-x-auto min-h-[60vh]">
              <MonthlyView
                monthInfo={monthInfo}
                workplaces={workplaces}
                getSchedulesForDate={getSchedulesForDate}
                getDaySummary={getDaySummary}
                formatDate={formatDate}
                onDayClick={handleMonthDayCellClick}
                onScheduleClick={setEditingSchedule}
                onDatePopupEdit={setEditingSchedule}
                onDayHover={handleDayHover}
                onDayLeave={handleDayLeave}
                hoveredDay={hoveredDay}
                hoverPosition={hoverPosition}
                weekStartDay={weekStartDay}
              />
            </div>
            <div className="px-6 py-5 border-t border-gray-100 bg-white">
              <p className="text-sm font-medium text-gray-800 mb-0.5">이번 달 예상 급여</p>
              <p className="text-xs text-gray-500 mb-2">
                총 {monthScheduleCount}건의 근무 일정이 있습니다. (주휴수당 포함)
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                {totalEstimatedSalary.toLocaleString()}원
              </p>
            </div>
            {schedules.length === 0 && (
              <div className="px-6 py-6 flex justify-center">
                <div className="w-full max-w-[894px] min-h-[200px] bg-slate-100 rounded-lg flex flex-col items-center justify-center py-10 px-4">
                  <p className="text-gray-900 text-base font-medium font-['Pretendard'] mb-2">
                    등록된 근무 일정이 없어요
                  </p>
                  <p className="text-slate-400 text-xs font-medium font-['Pretendard'] text-center leading-5 mb-4 max-w-[20rem]">
                    첫 근무 일정을 등록하면 근무 시간과 예상 급여를 한 번에 확인할 수 있어요.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-indigo-600 rounded-lg inline-flex items-center gap-1.5 text-white text-xs font-medium font-['Pretendard'] hover:bg-indigo-700"
                  >
                    <span className="text-base">+</span>
                    첫 근무 일정 등록하기
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 px-4 sm:px-6 pt-2 pb-4 overflow-auto min-h-0 overflow-x-auto">
              <WeeklyView
                weekDays={weekDays}
                workplaces={workplaces}
                timeSlots={timeSlots}
                getSchedulesForDate={getSchedulesForDate}
                getDaySummary={getDaySummary}
                formatDate={formatDate}
                onCellClick={handleCellClick}
                onScheduleClick={setEditingSchedule}
                onDayHover={handleDayHover}
                onDayLeave={handleDayLeave}
                hoveredDay={hoveredDay}
                hoverPosition={hoverPosition}
                weekStartDay={weekStartDay}
              />
            </div>
            <div className="px-6 py-5 border-t border-gray-100 bg-white">
              <p className="text-sm font-medium text-gray-800 mb-0.5">이번 달 예상 급여</p>
              <p className="text-xs text-gray-500 mb-2">
                총 {monthScheduleCount}건의 근무 일정이 있습니다. (주휴수당 포함)
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                {totalEstimatedSalary.toLocaleString()}원
              </p>
            </div>
          </>
        )}
      </div>

      {/* 오른쪽: 일정 요약 사이드바 */}
      <ScheduleSummarySidebar
        schedules={schedules}
        workplaces={workplaces}
        year={monthInfo.year}
        month={monthInfo.month}
        onScheduleClick={setEditingSchedule}
      />

      {showAddModal && (
        <AddScheduleModal
          workplaces={workplaces}
          onSave={handleAddSchedule}
          onClose={() => setShowAddModal(false)}
          onAddWorkplace={(workplace) => {
            setWorkplaces([...workplaces, workplace]);
          }}
        />
      )}

      {editingSchedule && (
        <ScheduleEditModal
          schedule={editingSchedule}
          workplaces={workplaces}
          onSave={handleEditSchedule}
          onDelete={handleDeleteSchedule}
          onClose={() => setEditingSchedule(null)}
          onAddWorkplace={(workplace) => setWorkplaces((prev) => [...prev, workplace])}
        />
      )}

      {/* 주간/월간 공통: 날짜 호버 시 알바 현황 툴팁 */}
      {hoveredDay && hoverPosition && getDaySummary(hoveredDay) && getDaySummary(hoveredDay)!.length > 0 && (
        <div
          className="fixed bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 z-50 pointer-events-none"
          style={{
            left: `${hoverPosition.x + 10}px`,
            top: `${hoverPosition.y + 10}px`,
            minWidth: '200px',
          }}
        >
          <div className="font-bold text-lg mb-2">알바 현황</div>
          {getDaySummary(hoveredDay)!.map((summary, index) => (
            <div
              key={index}
              className="mb-2 p-2 rounded"
              style={{ backgroundColor: summary.color + '20' }}
            >
              <div className="font-semibold" style={{ color: summary.color }}>
                {summary.workplaceName}
              </div>
              <div className="text-sm text-gray-600">{summary.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
