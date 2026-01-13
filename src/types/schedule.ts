// 일정 타입 정의
export interface ScheduleItem {
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


