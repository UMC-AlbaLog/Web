import { useState, useEffect, useMemo, useRef } from 'react';
import type { ScheduleItem, Workplace, DaySummary } from '../types/schedule';
import AddScheduleModal from '../components/schedule/AddScheduleModal';
import ScheduleEditModal from '../components/schedule/ScheduleEditModal';
import MonthlyView from '../components/schedule/MonthlyView';
import WeeklyView from '../components/schedule/WeeklyView';

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

  const goToToday = () => {
    setCurrentWeek(new Date());
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

  return (
    <div className="flex flex-col h-full bg-white p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">스케줄</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded ${
                viewMode === 'monthly' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded ${
                viewMode === 'weekly' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              주간
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + 일정 추가
          </button>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="flex items-center gap-4">
          <button
            onClick={viewMode === 'monthly' 
              ? () => {
                  const newDate = new Date(currentWeek);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentWeek(newDate);
                }
              : goToPreviousWeek
            }
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ◀
          </button>
          <span className="text-lg font-semibold">
            {viewMode === 'monthly' 
              ? `${monthInfo.year}년 ${monthInfo.month + 1}월`
              : `${startOfWeek.getFullYear()}년 ${startOfWeek.getMonth() + 1}월`
            }
          </span>
          <button
            onClick={viewMode === 'monthly'
              ? () => {
                  const newDate = new Date(currentWeek);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentWeek(newDate);
                }
              : goToNextWeek
            }
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ▶
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            오늘
          </button>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      {viewMode === 'monthly' ? (
        <MonthlyView
          monthInfo={monthInfo}
          workplaces={workplaces}
          getSchedulesForDate={getSchedulesForDate}
          formatDate={formatDate}
          onDayClick={handleMonthDayCellClick}
          onScheduleClick={setEditingSchedule}
        />
      ) : (
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
      )}

      {/* 새 일정 추가 모달 */}
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

      {/* 일정 수정 모달 */}
      {editingSchedule && (
        <ScheduleEditModal
          schedule={editingSchedule}
          workplaces={workplaces}
          onSave={handleEditSchedule}
          onDelete={handleDeleteSchedule}
          onClose={() => setEditingSchedule(null)}
        />
      )}
    </div>
  );
};

export default Schedule;
