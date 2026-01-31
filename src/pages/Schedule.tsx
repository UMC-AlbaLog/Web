import { useState, useEffect, useMemo } from 'react';
import type { ScheduleItem, Workplace, DaySummary } from '../types/schedule';
import AddScheduleModal from '../components/schedule/AddScheduleModal';
import ScheduleEditModal from '../components/schedule/ScheduleEditModal';
import MonthlyView from '../components/schedule/MonthlyView';
import WeeklyView from '../components/schedule/WeeklyView';
import ScheduleSummarySidebar from '../components/schedule/ScheduleSummarySidebar';
import { getEstimatedSalaryForMonth } from '../utils/scheduleUtils';

const Schedule = () => {
  // 상태 관리
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    // 초기 상태를 localStorage에서 직접 로드
    const saved = localStorage.getItem('schedules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🔵 schedules 초기 로드:', parsed.length, '개');
        return parsed;
      } catch (error) {
        console.error('❌ schedules 초기 로드 실패:', error);
      }
    }
    return [];
  });

  const [workplaces, setWorkplaces] = useState<Workplace[]>(() => {
    // 초기 상태를 localStorage에서 직접 로드
    const saved = localStorage.getItem('workplaces');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🔵 workplaces 초기 로드:', parsed.length, '개');
        return parsed;
      } catch (error) {
        console.error('❌ workplaces 초기 로드 실패:', error);
      }
    }
    // localStorage에 없으면 기본 작업장 반환
    return [
      { id: '1', name: '카페 A', color: '#FF6B6B' },
      { id: '2', name: '편의점 B', color: '#4ECDC4' },
      { id: '3', name: '음식점 C', color: '#FFE66D' },
    ];
  });

  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // 초기화 완료 플래그
  const [isInitialized, setIsInitialized] = useState(false);

  // 컴포넌트 마운트 후 저장 활성화
  useEffect(() => {
    console.log('✅ 컴포넌트 마운트 완료, 저장 활성화');
    setIsInitialized(true);
  }, []);

  // 스케줄 저장 (초기화 완료 후에만)
  useEffect(() => {
    if (isInitialized) {
      console.log('💾 schedules 저장:', schedules.length, '개');
      localStorage.setItem('schedules', JSON.stringify(schedules));
    }
  }, [schedules, isInitialized]);

  // workplaces 저장 (초기화 완료 후에만)
  useEffect(() => {
    if (isInitialized) {
      console.log('💾 workplaces 저장:', workplaces.length, '개');
      localStorage.setItem('workplaces', JSON.stringify(workplaces));
    }
  }, [workplaces, isInitialized]);

  // 주간 정보 가져오기
  const getWeekInfo = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // 일요일로 설정
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

  // 월간 정보 가져오기
  const getMonthInfo = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
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

  const { startOfWeek, weekDays } = useMemo(() => getWeekInfo(currentWeek), [currentWeek]);
  const monthInfo = useMemo(() => getMonthInfo(currentWeek), [currentWeek]);

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

  // 특정 날짜의 알바 현황 요약 가져오기
  const getDaySummary = (date: string): DaySummary[] | null => {
    const daySchedules = getSchedulesForDate(date);
    if (daySchedules.length === 0) return null;

    const summaries = daySchedules.map(schedule => {
      const workplace = workplaces.find(w => w.id === schedule.workplaceId);
      return {
        workplaceName: workplace?.name || '알 수 없음',
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

    setSchedules([...schedules, ...newSchedules]);
    setShowAddModal(false);
  };

  // 일정 수정
  const handleEditSchedule = (updatedSchedule: ScheduleItem) => {
    setSchedules(schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
    setEditingSchedule(null);
  };

  // 일정 삭제
  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter(s => s.id !== scheduleId));
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
    <div className="flex h-full bg-[#F8FAFC]">
      {/* 메인: 내 스케줄 + 캘린더 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더: 내 스케줄 + 월 네비 + 일정 추가 */}
        <div className="flex items-center justify-between gap-4 p-6 pb-4">
          <h1 className="text-xl font-bold text-gray-800">내 스케줄</h1>
          <div className="flex items-center gap-3">
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
              <span className="text-base font-semibold text-gray-800 min-w-[120px] text-center">
                | {viewMode === 'monthly'
                  ? `${monthInfo.year}년 ${monthInfo.month + 1}월`
                  : `${startOfWeek.getFullYear()}년 ${startOfWeek.getMonth() + 1}월`}
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

        {/* 빈 상태 vs 캘린더 */}
        {viewMode === 'monthly' && schedules.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-xl mx-6 border border-gray-100">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)' }}
            >
              <svg
                className="w-12 h-12 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-1">아직 일정이 등록되지 않았어요.</p>
            <p className="text-gray-500 text-sm text-center mb-6 max-w-sm">
              새 일정을 등록하여 근무 시간을 기록하고, 예상 급여를 확인해보세요.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              일정 추가하기
            </button>
          </div>
        ) : viewMode === 'monthly' ? (
          <>
            <div className="flex-1 px-6 overflow-auto">
              <MonthlyView
                monthInfo={monthInfo}
                workplaces={workplaces}
                getSchedulesForDate={getSchedulesForDate}
                formatDate={formatDate}
                onDayClick={handleMonthDayCellClick}
                onScheduleClick={setEditingSchedule}
                onDatePopupEdit={setEditingSchedule}
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
        ) : (
          <>
            <div className="flex-1 px-6 overflow-auto">
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
    </div>
  );
};

export default Schedule;
