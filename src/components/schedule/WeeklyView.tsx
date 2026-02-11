import type { ScheduleItem, Workplace, DaySummary } from '../../types/schedule';

interface WeeklyViewProps {
  weekDays: Date[];
  workplaces: Workplace[];
  timeSlots: string[];
  getSchedulesForDate: (date: string) => ScheduleItem[];
  getDaySummary: (date: string) => DaySummary[] | null;
  formatDate: (date: Date) => string;
  onCellClick: (date: string, time: string) => void;
  onScheduleClick: (schedule: ScheduleItem) => void;
  onDayHover: (date: string, event: React.MouseEvent) => void;
  onDayLeave: () => void;
  hoveredDay: string | null;
  hoverPosition: { x: number; y: number } | null;
}

const WeeklyView = ({
  weekDays,
  workplaces,
  timeSlots,
  getSchedulesForDate,
  getDaySummary,
  formatDate,
  onCellClick,
  onScheduleClick,
  onDayHover,
  onDayLeave,
  hoveredDay,
  hoverPosition,
}: WeeklyViewProps) => {
  return (
    <>
      <div className="flex-1 overflow-auto border border-gray-300 rounded-xl">
        <div className="min-w-[900px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-8 bg-gray-100 sticky top-0 z-10">
            <div className="p-4 border-b border-r border-gray-300 text-center text-base font-semibold">
              시간
            </div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="p-4 border-b border-r border-gray-300 text-center text-base font-semibold"
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

                // 현재 시간대에 일정이 있는지 확인하고 색상 가져오기
                const currentHour = parseInt(time.split(':')[0]);
                const currentSchedule = daySchedules.find(schedule => {
                  const startHour = parseInt(schedule.startTime.split(':')[0]);
                  const endHour = parseInt(schedule.endTime.split(':')[0]);
                  return currentHour >= startHour && currentHour < endHour;
                });
                
                const cellColor = currentSchedule 
                  ? workplaces.find(w => w.id === currentSchedule.workplaceId)?.color 
                  : null;

                return (
                  <div
                    key={dayIndex}
                    className="relative p-2 border-b border-r border-gray-300 min-h-[80px] cursor-pointer"
                    style={{
                      backgroundColor: cellColor ? `${cellColor}30` : 'transparent',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => onCellClick(dateStr, time)}
                    onMouseEnter={(e) => onDayHover(dateStr, e)}
                    onMouseMove={(e) => {
                      if (hoveredDay === dateStr) {
                        onDayHover(dateStr, e);
                      }
                    }}
                    onMouseLeave={onDayLeave}
                  >
                    {/* 일정이 있는 경우 ! 표시 */}
                    {hasSummary && timeIndex === 0 && (
                      <div className="absolute top-1 right-1 text-red-500 font-bold text-lg">
                        !
                      </div>
                    )}
                    
                    {/* 일정 항목 표시: 이 시간대 셀에서 시작하는 일정만 표시 (시작 분 포함) */}
                    {daySchedules.map(schedule => {
                      const startHour = parseInt(schedule.startTime.split(':')[0], 10);
                      const startMin = parseInt(schedule.startTime.split(':')[1] || '0', 10);
                      const endHour = parseInt(schedule.endTime.split(':')[0], 10);
                      const endMin = parseInt(schedule.endTime.split(':')[1] || '0', 10);
                      const currentHour = parseInt(time.split(':')[0], 10);

                      // 이 셀(현재 시간대)에서 일정이 시작할 때만 블록 렌더 (startMin 무관)
                      if (currentHour !== startHour) return null;

                      const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                      const durationHours = Math.max(0.25, durationMinutes / 60);
                      const workplace = workplaces.find(w => w.id === schedule.workplaceId);
                      const displayName = workplace?.name ?? schedule.scheduleName ?? '일정';
                      const pxPerHour = 60;
                      const topOffset = Math.round((startMin / 60) * pxPerHour);

                      return (
                        <div
                          key={schedule.id}
                          className="absolute left-2 right-2 p-2 rounded text-white text-xs cursor-pointer hover:opacity-90 shadow-sm overflow-hidden"
                          style={{
                            backgroundColor: workplace?.color || '#6366f1',
                            height: `${Math.round(durationHours * pxPerHour)}px`,
                            top: `${2 + topOffset}px`,
                            zIndex: 5,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onScheduleClick(schedule);
                          }}
                        >
                          <div className="font-semibold truncate" title={displayName}>{displayName}</div>
                          <div className="truncate">{schedule.startTime} - {schedule.endTime}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

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
    </>
  );
};

export default WeeklyView;


