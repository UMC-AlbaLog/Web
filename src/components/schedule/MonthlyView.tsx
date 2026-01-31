import { useState, useRef, useEffect } from 'react';
import type { ScheduleItem, Workplace } from '../../types/schedule';
import { getEstimatedPayForSchedule } from '../../utils/scheduleUtils';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

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
  onDatePopupEdit?: (schedule: ScheduleItem) => void;
}

const getDisplayName = (s: ScheduleItem, workplaces: Workplace[]) => {
  const wp = workplaces.find((w) => w.id === s.workplaceId);
  return s.scheduleName || wp?.name || '일정';
};

const getColor = (s: ScheduleItem, workplaces: Workplace[]) => {
  if (s.color) return s.color;
  const wp = workplaces.find((w) => w.id === s.workplaceId);
  return wp?.color ?? '#6B7280';
};

const MonthlyView = ({
  monthInfo,
  workplaces,
  getSchedulesForDate,
  formatDate,
  onDayClick,
  onScheduleClick,
  onDatePopupEdit,
}: MonthlyViewProps) => {
  const [popupDate, setPopupDate] = useState<string | null>(null);
  const [popupAnchor, setPopupAnchor] = useState<{ x: number; y: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popupDate) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupDate(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popupDate]);

  const handleCellClick = (day: Date, e: React.MouseEvent) => {
    const dateStr = formatDate(day);
    const daySchedules = getSchedulesForDate(dateStr);
    if (daySchedules.length > 0) {
      e.stopPropagation();
      setPopupAnchor({ x: e.clientX, y: e.clientY });
      setPopupDate(dateStr);
    } else {
      onDayClick(day, e);
    }
  };

  const daySchedulesForPopup = popupDate ? getSchedulesForDate(popupDate) : [];
  const popupDay = popupDate ? new Date(popupDate + 'T12:00:00') : null;

  return (
    <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white">
      <div className="grid grid-cols-7 bg-gray-50/80 border-b border-gray-200 sticky top-0 z-10">
        {DAY_NAMES.map((day, index) => (
          <div
            key={index}
            className="p-2.5 border-r border-gray-100 text-center text-sm font-medium text-gray-600 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {monthInfo.weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 min-h-[100px]">
          {week.map((day, dayIndex) => {
            const dateStr = formatDate(day);
            const daySchedules = getSchedulesForDate(dateStr);
            const isCurrentMonth = day.getMonth() === monthInfo.month;
            const isToday =
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={dayIndex}
                className={`min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50/50 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''
                } ${isToday ? 'ring-1 ring-indigo-200 ring-inset bg-indigo-50/30' : ''}`}
                onClick={(e) => handleCellClick(day, e)}
              >
                <div className="text-sm font-medium text-gray-700 mb-1">{day.getDate()}</div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule) => {
                    const color = getColor(schedule, workplaces);
                    const isHoliday = schedule.scheduleType === 'holiday';
                    const pay = getEstimatedPayForSchedule(schedule);
                    return (
                      <div
                        key={schedule.id}
                        className="text-xs rounded p-1.5 cursor-pointer hover:opacity-90 bg-gray-50 border-l-2"
                        style={{ borderLeftColor: isHoliday ? '#DC2626' : color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onScheduleClick(schedule);
                        }}
                      >
                        {isHoliday ? (
                          <span className="text-red-600 font-medium">휴무</span>
                        ) : (
                          <>
                            <div className="text-gray-800 truncate">
                              {schedule.startTime}-{schedule.endTime} {getDisplayName(schedule, workplaces)}
                            </div>
                            <div className="text-indigo-600 font-medium">
                              {pay > 0 ? `${pay.toLocaleString()}원` : ''}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-gray-400">+{daySchedules.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* 날짜 클릭 시 팝업: N월 N일 (요일) 알바 N건, 시간 겹침 보기, 정렬 */}
      {popupDate && popupAnchor && popupDay && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-80"
          style={{
            left: Math.min(popupAnchor.x, window.innerWidth - 320),
            top: Math.min(popupAnchor.y, window.innerHeight - 280),
          }}
        >
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            {popupDay.getMonth() + 1}월 {popupDay.getDate()}일 ({DAY_NAMES[popupDay.getDay()]}) 알바{' '}
            {daySchedulesForPopup.length}건
          </h4>
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input type="checkbox" className="rounded text-indigo-600" />
            <span className="text-sm text-gray-600">시간 겹치는 경우만 보기</span>
          </label>
          <ul className="space-y-2 mb-3">
            {daySchedulesForPopup.map((s) => (
              <li key={s.id} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-500 shrink-0">
                  {getDisplayName(s, workplaces)} | {s.startTime}~{s.endTime}
                </span>
                <span className="text-xs text-gray-500 shrink-0">
                  {s.scheduleType === 'holiday' ? '휴무' : '정규 알바'}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              정렬
            </button>
            <button
              type="button"
              onClick={() => {
                if (daySchedulesForPopup[0]) onDatePopupEdit?.(daySchedulesForPopup[0]);
                setPopupDate(null);
              }}
              className="flex-1 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"
            >
              편집
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyView;


