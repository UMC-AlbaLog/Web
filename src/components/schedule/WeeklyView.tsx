import type { ScheduleItem, Workplace, DaySummary } from '../../types/schedule';
import { formatTime, formatTimeRange, getUse24HourSetting } from '../../utils/timeFormat';

const DAY_NAMES_SUNDAY = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_NAMES_MONDAY = ['월', '화', '수', '목', '금', '토', '일'];

const ROW_HEIGHT_PX = 60;
const FIRST_HOUR = 6; // timeSlots[0] = 06:00

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
  weekStartDay?: '일요일' | '월요일';
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
  hoverPosition: _hoverPosition,
  weekStartDay = '일요일',
}: WeeklyViewProps) => {
  const DAY_NAMES = weekStartDay === '월요일' ? DAY_NAMES_MONDAY : DAY_NAMES_SUNDAY;
  const use24Hour = getUse24HourSetting();
  const overlayHeight = timeSlots.length * ROW_HEIGHT_PX;

  return (
    <>
      <div className="flex-1 overflow-auto border border-gray-300 rounded-xl min-w-0 relative">
        <div className="min-w-[800px] relative" style={{ minWidth: 'max(800px, 100%)' }}>
          {/* 단일 그리드: 헤더 1행 + 시간대별 1행씩 (고정 행 높이로 일정 블록이 여러 행을 채우도록) */}
          <div
            className="grid bg-gray-100 sticky top-0 z-10"
            style={{
              gridTemplateColumns: '80px repeat(7, minmax(90px, 1fr))',
              gridTemplateRows: `${ROW_HEIGHT_PX}px repeat(${timeSlots.length}, ${ROW_HEIGHT_PX}px)`,
            }}
          >
            {/* 헤더 행 */}
            <div className="p-2 border-b border-r border-gray-300 text-center text-base font-semibold flex items-center justify-center" style={{ gridColumn: 1, gridRow: 1 }}>
              시간
            </div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="p-2 border-b border-r border-gray-300 text-center text-base font-semibold min-w-0 flex flex-col items-center justify-center"
                style={{ gridColumn: index + 2, gridRow: 1 }}
              >
                <div>{DAY_NAMES[day.getDay()]}</div>
                <div className="text-sm text-gray-600">{day.getDate()}</div>
              </div>
            ))}
            {/* 시간 열 */}
            {timeSlots.map((time, timeIndex) => (
              <div
                key={timeIndex}
                className="py-1 px-2 border-b border-r border-gray-300 text-center text-sm text-gray-600 min-w-0 flex items-center justify-center"
                style={{ gridColumn: 1, gridRow: timeIndex + 2 }}
              >
                {formatTime(time, use24Hour)}
              </div>
            ))}
            {/* 날짜별·시간별 셀 (클릭/호버용, 배경색) */}
            {weekDays.map((day, dayIndex) =>
              timeSlots.map((time, timeIndex) => {
                const dateStr = formatDate(day);
                const daySchedules = getSchedulesForDate(dateStr);
                const hasSummary = getDaySummary(dateStr);
                const currentHour = parseInt(time.split(':')[0], 10);
                const currentSchedule = daySchedules.find((schedule) => {
                  const startHour = parseInt(schedule.startTime.split(':')[0], 10);
                  const endHour = parseInt(schedule.endTime.split(':')[0], 10);
                  return currentHour >= startHour && currentHour < endHour;
                });
                const cellColor = currentSchedule
                  ? workplaces.find((w) => w.id === currentSchedule.workplaceId)?.color
                  : null;
                return (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className="relative border-b border-r border-gray-300 cursor-pointer min-w-0"
                    style={{
                      gridColumn: dayIndex + 2,
                      gridRow: timeIndex + 2,
                      backgroundColor: cellColor ? `${cellColor}20` : 'transparent',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => onCellClick(dateStr, time)}
                    onMouseEnter={(e) => onDayHover(dateStr, e)}
                    onMouseMove={(e) => {
                      if (hoveredDay === dateStr) onDayHover(dateStr, e);
                    }}
                    onMouseLeave={onDayLeave}
                  >
                    {hasSummary && timeIndex === 0 && (
                      <div className="absolute top-0.5 right-0.5 text-red-500 font-bold text-sm">
                        !
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 일정 블록 오버레이: 시작~종료 시간에 맞춰 여러 행을 채움 (overflow 없음) */}
          <div
            className="absolute left-0 pointer-events-none"
            style={{
              top: ROW_HEIGHT_PX,
              width: '100%',
              height: overlayHeight,
              zIndex: 5,
            }}
          >
            <div className="relative w-full h-full" style={{ pointerEvents: 'none' }}>
              {weekDays.map((day, dayIndex) => {
                const dateStr = formatDate(day);
                const daySchedules = getSchedulesForDate(dateStr);
                return daySchedules.map((schedule) => {
                  const startHour = parseInt(schedule.startTime.split(':')[0], 10);
                  const startMin = parseInt(schedule.startTime.split(':')[1] || '0', 10);
                  const endHour = parseInt(schedule.endTime.split(':')[0], 10);
                  const endMin = parseInt(schedule.endTime.split(':')[1] || '0', 10);
                  const topPx =
                    (startHour - FIRST_HOUR) * ROW_HEIGHT_PX +
                    (startMin / 60) * ROW_HEIGHT_PX;
                  const durationMin = endHour * 60 + endMin - (startHour * 60 + startMin);
                  const heightPx = Math.max(ROW_HEIGHT_PX * 0.25, (durationMin / 60) * ROW_HEIGHT_PX);
                  const workplace = workplaces.find((w) => w.id === schedule.workplaceId);
                  const displayName =
                    workplace?.name ?? schedule.scheduleName ?? '일정';
                  return (
                    <div
                      key={schedule.id}
                      className="absolute rounded p-1.5 text-white text-xs cursor-pointer hover:opacity-90 shadow-sm overflow-hidden flex flex-col pointer-events-auto"
                      style={{
                        left: `calc(80px + (100% - 80px) * ${dayIndex} / 7 + 4px)`,
                        width: `calc((100% - 80px) / 7 - 8px)`,
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        backgroundColor: workplace?.color || '#6366f1',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleClick(schedule);
                      }}
                    >
                      <div className="font-semibold truncate min-w-0" title={displayName}>
                        {displayName}
                      </div>
                      <div className="truncate min-w-0 text-[10px]">
                        {formatTimeRange(
                          schedule.startTime,
                          schedule.endTime,
                          use24Hour
                        )}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WeeklyView;