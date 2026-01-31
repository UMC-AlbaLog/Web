// 일정 타입 정의
export type ScheduleType = 'work' | 'holiday';
export type SalaryType = 'hourly' | 'daily' | 'monthly' | 'per_task';

export interface ScheduleItem {
  id: string;
  workplaceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hourlyWage?: number;
  dailyWage?: number;
  memo?: string;
  repeatType?: 'none' | 'daily' | 'weekly' | 'biweekly';
  repeatDays?: number[]; // 0-6 (일-토)
  /** 일정 명 (표시용, 없으면 workplace name 사용) */
  scheduleName?: string;
  /** 근무 / 휴무 */
  scheduleType?: ScheduleType;
  /** 시급 / 일급 / 월급 / 건당 */
  salaryType?: SalaryType;
  /** 쉬는 시간 (분) */
  breakMinutes?: number;
  /** 일정 색상 (수정 모달에서 선택, 없으면 workplace color) */
  color?: string;
  /** 알림 설정 */
  notification?: boolean;
}

export const SCHEDULE_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#6B7280',
];

export interface Workplace {
  id: string;
  name: string;
  color: string;
}

export interface DaySummary {
  workplaceName: string;
  time: string;
  color: string;
}


