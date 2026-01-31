import type { ScheduleItem, Workplace } from '../../types/schedule';
import {
  getTotalHoursForMonth,
  getEstimatedSalaryForMonth,
  getWorkDaysForMonth,
  getEstimatedPayForSchedule,
} from '../../utils/scheduleUtils';
import { useUser } from '../../hooks/useUser';

interface ScheduleSummarySidebarProps {
  schedules: ScheduleItem[];
  workplaces: Workplace[];
  year: number;
  month: number;
  onScheduleClick?: (schedule: ScheduleItem) => void;
}

const ScheduleSummarySidebar = ({
  schedules,
  workplaces,
  year,
  month,
  onScheduleClick,
}: ScheduleSummarySidebarProps) => {
  const { profile, displayName } = useUser();
  const totalHours = getTotalHoursForMonth(schedules, year, month + 1);
  const estimatedSalary = getEstimatedSalaryForMonth(schedules, year, month + 1);
  const workDays = getWorkDaysForMonth(schedules, year, month + 1);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySchedules = schedules
    .filter((s) => s.date === todayStr && s.scheduleType !== 'holiday')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getDisplayName = (s: ScheduleItem) => {
    const wp = workplaces.find((w) => w.id === s.workplaceId);
    return s.scheduleName || wp?.name || '일정';
  };

  const getColor = (s: ScheduleItem) => {
    if (s.color) return s.color;
    const wp = workplaces.find((w) => w.id === s.workplaceId);
    return wp?.color ?? '#6B7280';
  };

  const formatDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const m = eh * 60 + em - (sh * 60 + sm);
    const h = Math.floor(m / 60);
    return `${h}시간`;
  };

  const notifications = [
    { id: '1', text: '스크랩 해둔 알바가 곧 지원..', time: '8:20 PM', bg: 'bg-green-100', iconColor: 'text-green-600' },
    { id: '2', text: '어제 근무한 00점 리뷰를 남..', time: '6:45 PM', bg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { id: '3', text: '빈 시간에 맞는 추천 알바가 기다리...', time: '4:10 PM', bg: 'bg-blue-100', iconColor: 'text-blue-600' },
  ];

  return (
    <aside className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* 프로필 */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        {profile?.picture ? (
          <img
            src={profile.picture}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
            {displayName?.slice(0, 1) ?? '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName || '사용자'}</p>
          <p className="text-xs text-gray-500">프로알바러</p>
        </div>
        <button type="button" className="p-1 text-gray-400 hover:text-gray-600" aria-label="메뉴">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* N월 총 근무 시간 / 근무 일수 / 예상 급여 */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-1">{month + 1}월 총 근무 시간</p>
        <p className="text-lg font-semibold text-gray-800">{Math.round(totalHours)}시간</p>
        <p className="text-xs text-gray-500 mt-2">근무 일수</p>
        <p className="text-sm font-medium text-gray-800">{workDays}일</p>
        <p className="text-xs text-gray-500 mt-2">예상 급여</p>
        <p className="text-lg font-bold text-indigo-600">{estimatedSalary.toLocaleString()}원</p>
      </div>

      {/* 오늘 일정 */}
      <div className="p-4 border-b border-gray-100 flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">오늘 일정</h3>
        <p className="text-xs text-gray-500 mb-2">{todaySchedules.length}건</p>
        <ul className="space-y-2">
          {todaySchedules.length === 0 ? (
            <li className="text-sm text-gray-400">오늘 일정이 없습니다</li>
          ) : (
            todaySchedules.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onScheduleClick?.(s)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: getColor(s) }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{getDisplayName(s)}</p>
                  <p className="text-xs text-indigo-600 font-medium">
                    {getEstimatedPayForSchedule(s).toLocaleString()}원
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.startTime}-{s.endTime} ({formatDuration(s.startTime, s.endTime)})
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* 알림 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-800">알림</span>
        </div>
        <ul className="space-y-2">
          {notifications.map((n, i) => (
            <li key={n.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.bg}`}>
                {i === 0 ? (
                  <svg className={`w-4 h-4 ${n.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : i === 1 ? (
                  <svg className={`w-4 h-4 ${n.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 ${n.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-700 truncate">{n.text}</p>
                <p className="text-xs text-indigo-600 mt-0.5">전체 보기</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{n.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default ScheduleSummarySidebar;
