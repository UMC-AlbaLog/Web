import { useState, useEffect, useMemo } from 'react';

// 일정 타입 정의
interface ScheduleItem {
  id: string;
  workplaceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hourlyWage?: number;
  memo?: string;
  repeatType?: 'none' | 'daily' | 'weekly' | 'biweekly';
  repeatDays?: number[]; // 0-6 (일-토)
}

interface Workplace {
  id: string;
  name: string;
  color: string;
}

const Schedule = () => {
  // 상태 관리
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedSchedules = localStorage.getItem('schedules');
    const savedWorkplaces = localStorage.getItem('workplaces');
    
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
    
    if (savedWorkplaces) {
      setWorkplaces(JSON.parse(savedWorkplaces));
    } else {
      // 기본 작업장 추가
      const defaultWorkplaces: Workplace[] = [
        { id: '1', name: '카페 A', color: '#FF6B6B' },
        { id: '2', name: '편의점 B', color: '#4ECDC4' },
        { id: '3', name: '음식점 C', color: '#FFE66D' },
      ];
      setWorkplaces(defaultWorkplaces);
      localStorage.setItem('workplaces', JSON.stringify(defaultWorkplaces));
    }
  }, []);

  // 스케줄 저장
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

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
    
    // 이번 달의 첫날
    const firstDayOfMonth = new Date(year, month, 1);
    // 이번 달의 마지막날
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 캘린더 시작일 (첫 주 일요일)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // 캘린더 종료일 (마지막 주 토요일)
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    // 주별로 날짜 배열 생성
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
  const getDaySummary = (date: string) => {
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
    // 해당 시간대에 일정이 없는 경우에만 추가 모달 열기
    const hasScheduleInSlot = daySchedules.some(schedule => {
      return schedule.startTime <= timeSlot && schedule.endTime > timeSlot;
    });

    if (!hasScheduleInSlot) {
      setShowAddModal(true);
    }
  };

  // 월간 뷰에서 날짜 더블클릭 시 일정 추가
  const handleMonthDayCellClick = (day: Date, e: React.MouseEvent) => {
    // 더블클릭이 아니면 주간 뷰로 전환
    if (e.detail === 1) {
      setTimeout(() => {
        if (e.detail === 1) {
          setCurrentWeek(day);
          setViewMode('weekly');
        }
      }, 200);
    } else if (e.detail === 2) {
      // 더블클릭이면 일정 추가 모달
      e.stopPropagation();
      setShowAddModal(true);
    }
  };

  // 일정 추가
  const handleAddSchedule = (schedule: ScheduleItem) => {
    setSchedules([...schedules, schedule]);
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
        // 월간 보기
        <div className="flex-1 overflow-auto border border-gray-300 rounded bg-white">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 bg-gray-100 sticky top-0 z-10">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={index}
                className="p-3 border-b border-r border-gray-300 text-center font-semibold"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 주별 날짜 그리드 */}
          {monthInfo.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const dateStr = formatDate(day);
                const daySchedules = getSchedulesForDate(dateStr);
                const isCurrentMonth = day.getMonth() === monthInfo.month;

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[120px] p-2 border-b border-r border-gray-300 cursor-pointer hover:bg-gray-50 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    }`}
                    onClick={(e) => handleMonthDayCellClick(day, e)}
                  >
                    {/* 날짜 */}
                    <div className="text-sm font-semibold mb-1">
                      {day.getDate()}
                    </div>

                    {/* 일정 목록 */}
                    <div className="space-y-1">
                      {daySchedules.slice(0, 3).map(schedule => {
                        const workplace = workplaces.find(w => w.id === schedule.workplaceId);
                        return (
                          <div
                            key={schedule.id}
                            className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80"
                            style={{ backgroundColor: workplace?.color || '#gray' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSchedule(schedule);
                            }}
                          >
                            {workplace?.name} {schedule.startTime}
                          </div>
                        );
                      })}
                      {daySchedules.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{daySchedules.length - 3}개 더보기
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        // 주간 보기 (시간대별 상세)
        <div className="flex-1 overflow-auto border border-gray-300 rounded">
          <div className="min-w-[800px]">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-8 bg-gray-100 sticky top-0 z-10">
              <div className="p-3 border-b border-r border-gray-300 text-center font-semibold">
                시간
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="p-3 border-b border-r border-gray-300 text-center font-semibold"
                >
                  <div>{['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}</div>
                  <div className="text-sm text-gray-600">{day.getDate()}</div>
                </div>
              ))}
            </div>

            {/* 시간대별 그리드 */}
            {timeSlots.map((time, timeIndex) => (
              <div key={timeIndex} className="grid grid-cols-8 relative">
                <div className="p-3 border-b border-r border-gray-300 text-center text-sm text-gray-600">
                  {time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dateStr = formatDate(day);
                  const daySchedules = getSchedulesForDate(dateStr);
                  const hasSummary = getDaySummary(dateStr);

                  return (
                    <div
                      key={dayIndex}
                      className="relative p-2 border-b border-r border-gray-300 min-h-[60px] hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCellClick(dateStr, time)}
                      onMouseEnter={(e) => handleDayHover(dateStr, e)}
                      onMouseMove={(e) => {
                        if (hoveredDay === dateStr) {
                          setHoverPosition({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onMouseLeave={handleDayLeave}
                    >
                      {/* 일정이 있는 경우 ! 표시 */}
                      {hasSummary && timeIndex === 0 && (
                        <div className="absolute top-1 right-1 text-red-500 font-bold text-lg">
                          !
                        </div>
                      )}
                      
                      {/* 일정 항목 표시 */}
                      {daySchedules.map(schedule => {
                        const startHour = parseInt(schedule.startTime.split(':')[0]);
                        const startMin = parseInt(schedule.startTime.split(':')[1]);
                        const endHour = parseInt(schedule.endTime.split(':')[0]);
                        const endMin = parseInt(schedule.endTime.split(':')[1]);
                        
                        const currentHour = parseInt(time.split(':')[0]);
                        
                        // 이 시간대에 일정이 시작되는 경우에만 표시
                        if (startHour === currentHour && startMin === 0) {
                          const duration = (endHour - startHour) + (endMin - startMin) / 60;
                          const workplace = workplaces.find(w => w.id === schedule.workplaceId);
                          
                          return (
                            <div
                              key={schedule.id}
                              className="absolute inset-x-2 p-2 rounded text-white text-xs cursor-pointer hover:opacity-80"
                              style={{
                                backgroundColor: workplace?.color || '#gray',
                                height: `${duration * 60}px`,
                                top: '2px',
                                zIndex: 5,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSchedule(schedule);
                              }}
                            >
                              <div className="font-semibold">{workplace?.name}</div>
                              <div>{schedule.startTime} - {schedule.endTime}</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 호버 툴팁 */}
      {hoveredDay && hoverPosition && (
        <div
          className="fixed bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 z-50"
          style={{
            left: `${hoverPosition.x + 10}px`,
            top: `${hoverPosition.y + 10}px`,
            minWidth: '200px',
          }}
        >
          <div className="font-bold text-lg mb-2">알바 현황</div>
          {getDaySummary(hoveredDay)?.map((summary, index) => (
            <div key={index} className="mb-2 p-2 rounded" style={{ backgroundColor: summary.color + '20' }}>
              <div className="font-semibold" style={{ color: summary.color }}>
                {summary.workplaceName}
              </div>
              <div className="text-sm text-gray-600">{summary.time}</div>
            </div>
          ))}
        </div>
      )}

      {/* 새 일정 추가 모달 */}
      {showAddModal && (
        <AddScheduleModal
          workplaces={workplaces}
          onSave={handleAddSchedule}
          onClose={() => setShowAddModal(false)}
          onAddWorkplace={(workplace) => {
            setWorkplaces([...workplaces, workplace]);
            localStorage.setItem('workplaces', JSON.stringify([...workplaces, workplace]));
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

// 새 일정 추가 모달 컴포넌트
const AddScheduleModal = ({
  workplaces,
  onSave,
  onClose,
  onAddWorkplace,
}: {
  workplaces: Workplace[];
  onSave: (schedule: ScheduleItem) => void;
  onClose: () => void;
  onAddWorkplace: (workplace: Workplace) => void;
}) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [memo, setMemo] = useState('');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'biweekly'>('none');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);

  const handleSubmit = () => {
    if (!selectedWorkplace || !date || !startTime || !endTime) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      workplaceId: selectedWorkplace,
      date,
      startTime,
      endTime,
      hourlyWage: hourlyWage ? parseFloat(hourlyWage) : undefined,
      memo,
      repeatType,
      repeatDays: repeatType !== 'none' ? repeatDays : undefined,
    };

    onSave(newSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">새 알바 일정 추가</h2>

        {/* 알바 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">알바 선택</label>
          <select
            value={selectedWorkplace}
            onChange={(e) => setSelectedWorkplace(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">선택하세요</option>
            {workplaces.map(workplace => (
              <option key={workplace.id} value={workplace.id}>
                {workplace.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowWorkplaceModal(true)}
            className="mt-2 text-blue-500 hover:underline text-sm"
          >
            + 새 알바 등록하기
          </button>
        </div>

        {/* 날짜 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 시간 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">시작 시간</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">종료 시간</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* 반복 설정 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">반복 설정</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="none"
                checked={repeatType === 'none'}
                onChange={() => setRepeatType('none')}
                className="mr-2"
              />
              없음
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="daily"
                checked={repeatType === 'daily'}
                onChange={() => setRepeatType('daily')}
                className="mr-2"
              />
              매일
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="weekly"
                checked={repeatType === 'weekly'}
                onChange={() => setRepeatType('weekly')}
                className="mr-2"
              />
              매주
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="biweekly"
                checked={repeatType === 'biweekly'}
                onChange={() => setRepeatType('biweekly')}
                className="mr-2"
              />
              격주
            </label>
          </div>
        </div>

        {/* 시급 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">시급 (선택)</label>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(e.target.value)}
            placeholder="시급을 입력하세요"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 메모 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            className="w-full p-2 border border-gray-300 rounded h-20"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </div>

      {/* 새 알바 등록 모달 */}
      {showWorkplaceModal && (
        <AddWorkplaceModal
          onSave={(workplace) => {
            onAddWorkplace(workplace);
            setShowWorkplaceModal(false);
            setSelectedWorkplace(workplace.id);
          }}
          onClose={() => setShowWorkplaceModal(false)}
        />
      )}
    </div>
  );
};

// 새 알바 등록 모달
const AddWorkplaceModal = ({
  onSave,
  onClose,
}: {
  onSave: (workplace: Workplace) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF6B6B');

  const handleSubmit = () => {
    if (!name) {
      alert('알바 이름을 입력해주세요.');
      return;
    }

    const newWorkplace: Workplace = {
      id: Date.now().toString(),
      name,
      color,
    };

    onSave(newWorkplace);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">새 알바 등록</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">알바 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 카페 A"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">색상</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 p-1 border border-gray-300 rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

// 일정 수정 모달
const ScheduleEditModal = ({
  schedule,
  workplaces,
  onSave,
  onDelete,
  onClose,
}: {
  schedule: ScheduleItem;
  workplaces: Workplace[];
  onSave: (schedule: ScheduleItem) => void;
  onDelete: (scheduleId: string) => void;
  onClose: () => void;
}) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState(schedule.workplaceId);
  const [date, setDate] = useState(schedule.date);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);
  const [hourlyWage, setHourlyWage] = useState(schedule.hourlyWage?.toString() || '');
  const [memo, setMemo] = useState(schedule.memo || '');

  const handleSubmit = () => {
    if (!selectedWorkplace || !date || !startTime || !endTime) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const updatedSchedule: ScheduleItem = {
      ...schedule,
      workplaceId: selectedWorkplace,
      date,
      startTime,
      endTime,
      hourlyWage: hourlyWage ? parseFloat(hourlyWage) : undefined,
      memo,
    };

    onSave(updatedSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">일정 수정</h2>

        {/* 알바 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">알바 선택</label>
          <select
            value={selectedWorkplace}
            onChange={(e) => setSelectedWorkplace(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {workplaces.map(workplace => (
              <option key={workplace.id} value={workplace.id}>
                {workplace.name}
              </option>
            ))}
          </select>
        </div>

        {/* 날짜 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 시간 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">시작 시간</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">종료 시간</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* 시급 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">시급 (선택)</label>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(e.target.value)}
            placeholder="시급을 입력하세요"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 메모 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            className="w-full p-2 border border-gray-300 rounded h-20"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-between">
          <button
            onClick={() => {
              if (confirm('정말 삭제하시겠습니까?')) {
                onDelete(schedule.id);
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            삭제
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
