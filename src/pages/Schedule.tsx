import { useState, useMemo } from 'react';
import type { ScheduleItem, DaySummary, Workplace } from '../types/schedule';
import AddScheduleModal from '../components/schedule/AddScheduleModal';
import ScheduleEditModal from '../components/schedule/ScheduleEditModal';
import MonthlyView from '../components/schedule/MonthlyView';
import WeeklyView from '../components/schedule/WeeklyView';
import ScheduleSummarySidebar from '../components/schedule/ScheduleSummarySidebar';
import { getEstimatedSalaryForMonth } from '../utils/scheduleUtils';
import { useSchedules } from '../contexts/SchedulesContext';
import { getAccessToken } from '../api/client';
import { createManualSchedule, updateSchedule, deleteSchedule } from '../api/schedule';
import type { CreateManualScheduleBody, UpdateManualScheduleBody } from '../api/types';

function scheduleToBody(schedule: ScheduleItem, workplaces: Workplace[]): CreateManualScheduleBody {
  const wp = workplaces.find((w) => w.id === schedule.workplaceId);
  const workTime = `${schedule.startTime}-${schedule.endTime}`;
  const body: CreateManualScheduleBody = {
    workplace: wp?.name ?? undefined,
    work_date: schedule.date,
    work_time: workTime,
    hourly_wage: schedule.hourlyWage,
    memo: schedule.memo,
  };
  if (schedule.repeatType && schedule.repeatType !== 'none') {
    body.repeat_type = schedule.repeatType;
    body.repeat_days = schedule.repeatDays?.join(',') ?? '';
  }
  return body;
}

function scheduleToUpdateBody(schedule: ScheduleItem, workplaces: Workplace[]): UpdateManualScheduleBody {
  const wp = workplaces.find((w) => w.id === schedule.workplaceId);
  const workTime = `${schedule.startTime}-${schedule.endTime}`;
  const body: UpdateManualScheduleBody = {
    workplace: wp?.name,
    work_date: schedule.date,
    work_time: workTime,
    hourly_wage: schedule.hourlyWage,
    memo: schedule.memo,
  };
  if (schedule.repeatType && schedule.repeatType !== 'none') {
    body.repeat_type = schedule.repeatType;
    body.repeat_days = schedule.repeatDays?.join(',') ?? '';
  }
  return body;
}

const Schedule = () => {
  const { schedules, workplaces, setSchedules, setWorkplaces } = useSchedules();

  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

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

  // 일정 추가 (반복 설정 적용) + API 연동
  const handleAddSchedule = async (schedule: ScheduleItem) => {
    const newSchedules: ScheduleItem[] = [{ ...schedule }];

    if (schedule.repeatType && schedule.repeatType !== 'none') {
      const baseDate = new Date(schedule.date);
      const endDate = new Date(baseDate);
      endDate.setMonth(endDate.getMonth() + 3);
      let currentDate = new Date(baseDate);

      if (schedule.repeatType === 'daily') {
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

    const token = getAccessToken();
    if (token) {
      try {
        const body = scheduleToBody(schedule, workplaces);
        const res = await createManualSchedule(body);
        if (res?.user_alba_schedule_id) {
          newSchedules[0] = { ...newSchedules[0], id: res.user_alba_schedule_id };
        }
      } catch {
        // API 실패 시 로컬만 반영
      }
    } else if (import.meta.env.DEV) {
      console.warn("[스케줄] accessToken이 없어 API를 호출하지 않았습니다. 로그인 후 Session Storage에 accessToken이 있어야 백엔드에 저장됩니다.");
    }

    setSchedules((prev) => [...prev, ...newSchedules]);
    setShowAddModal(false);
  };

  // 일정 수정 + API 연동
  const handleEditSchedule = async (updatedSchedule: ScheduleItem) => {
    const token = getAccessToken();
    if (token) {
      try {
        const body = scheduleToUpdateBody(updatedSchedule, workplaces);
        await updateSchedule(updatedSchedule.id, body);
      } catch {
        // API 실패 시에도 로컬은 반영
      }
    } else if (import.meta.env.DEV) {
      console.warn("[스케줄] accessToken이 없어 수정 API를 호출하지 않았습니다.");
    }
    setSchedules((prev) => prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)));
    setEditingSchedule(null);
  };

  // 일정 삭제 + API 연동
  const handleDeleteSchedule = async (scheduleId: string) => {
    const token = getAccessToken();
    if (token) {
      try {
        await deleteSchedule(scheduleId);
      } catch {
        // API 실패 시에도 로컬에서는 제거
      }
    } else if (import.meta.env.DEV) {
      console.warn("[스케줄] accessToken이 없어 삭제 API를 호출하지 않았습니다.");
    }
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
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
    <div className="flex h-full bg-slate-50">
      {/* 메인: 내 스케줄 + 캘린더 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더: 내 스케줄 + 월 네비 + 일정 추가 */}
        <div className="flex items-center justify-between gap-4 p-6 pb-6">
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

        {/* 빈 상태: 캘린더 그리드 + 아래 빈 상태 박스 */}
        {viewMode === 'monthly' && schedules.length === 0 ? (
          <>
            <div className="flex-1 px-6 pt-2 pb-4 overflow-auto min-h-[65vh]">
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
            <div className="px-6 py-6 flex justify-center">
              <div className="w-full max-w-[894px] min-h-[280px] bg-slate-100 rounded-lg flex flex-col items-center justify-center py-12 px-4">
                <div className="w-20 h-20 bg-indigo-200/70 rounded-[40px] border border-black/10 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 text-base font-medium font-['Pretendard'] mb-2">
                  등록된 근무 일정이 없어요
                </p>
                <p className="text-slate-400 text-xs font-medium font-['Pretendard'] text-center leading-5 mb-6 max-w-[20rem]">
                  첫 근무 일정을 등록하면 근무 시간과 예상 급여를 한 번에
                  <br />
                  확인할 수 있어요.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-indigo-600 rounded-lg inline-flex items-center gap-1.5 text-white text-xs font-medium font-['Pretendard'] hover:bg-indigo-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  첫 근무 일정 등록하기
                </button>
                <p className="text-slate-400 text-xs font-medium font-['Pretendard'] text-center leading-5 mt-6 max-w-[20rem]">
                  오른쪽 상단 버튼이나 날짜 셀을 눌러서도 일정을 추가할 수
                  <br />
                  있어요.
                </p>
              </div>
            </div>
          </>
        ) : viewMode === 'monthly' ? (
          <>
            <div className="flex-1 px-6 pt-2 pb-4 overflow-auto min-h-[65vh]">
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
            <div className="flex-1 px-6 pt-2 pb-4 overflow-auto min-h-[65vh]">
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
