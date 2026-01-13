import type { ScheduleItem, Workplace } from '../../types/schedule';

interface MonthlyViewProps {
  monthInfo: {
    year: number;
    month: number;
    weeks: Date[][];
  };
  workplaces: Workplace[];
  getSchedulesForDate: (date: string) => ScheduleItem[];
  formatDate: (date: Date) => string;
  onDayClick: (day: Date, e: React.MouseEvent) => void;
  onScheduleClick: (schedule: ScheduleItem) => void;
}

const MonthlyView = ({
  monthInfo,
  workplaces,
  getSchedulesForDate,
  formatDate,
  onDayClick,
  onScheduleClick,
}: MonthlyViewProps) => {
  return (
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
                onClick={(e) => onDayClick(day, e)}
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
                          onScheduleClick(schedule);
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
  );
};

export default MonthlyView;

