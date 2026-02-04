/** 정산 상태 목록 조회 - 필터 */
export type SettlementStatusFilter = "all" | "waiting" | "paid" | "unpaid";

/** 정산 상태 목록 조회 - 정렬 */
export type SettlementSort = "latest" | "oldest";

/** API 정산 상태 (waiting | paid | unpaid) */
export type ApiSettlementStatus = "waiting" | "paid" | "unpaid";

/** 정산 상태 목록 항목 */
export interface SettlementStatusItem {
  workDate: string; // YYYY-MM-DD
  workplaceName: string;
  workMinutes: number;
  expectedPay: number;
  actualPay: number;
  settlementStatus: ApiSettlementStatus;
}

/** 정산 상태 목록 응답 */
export interface SettlementStatusListResponse {
  items: SettlementStatusItem[];
  nextCursor?: string | null;
  hasNext: boolean;
}

/** 수입 대시보드 - 브랜드별 수입 */
export interface BrandIncomeItem {
  brandName: string;
  actualPay: number;
}

/** 수입 대시보드 성공 응답 */
export interface IncomeDashboardSuccess {
  month: string; // YYYY-MM
  incomeGoal: number;
  expectedIncome: number;
  actualIncome: number;
  brandIncomes: BrandIncomeItem[];
}

/** Tsoa 공통 래퍼 */
export interface TsoaResponse<T> {
  resultType: "SUCCESS" | "FAIL";
  success: T | null;
  error?: {
    errorCode: string;
    errorMessage: string;
  };
}

/** 스케줄 수동 생성 Body */
export interface CreateManualScheduleBody {
  workplace?: string;
  work_date?: string;
  work_time?: string;
  day_of_week?: string;
  repeat_type?: string;
  repeat_days?: string;
  hourly_wage?: number;
  memo?: string;
}

/** 스케줄 수정 Body (부분 수정, 전부 optional) */
export interface UpdateManualScheduleBody {
  workplace?: string;
  work_date?: string;
  work_time?: string;
  day_of_week?: string;
  repeat_type?: string;
  repeat_days?: string;
  hourly_wage?: number;
  memo?: string;
}

/** 오늘의 근무 리스트 - 스케줄 항목 (GET /api/work-logs/today) */
export interface TodayWorkLogScheduleItem {
  workLogId: string;
  status: string;
  statusLabel: string;
  workplace: string;
  startTime: string;
  endTime: string;
  workHours: number;
  hourlyWage: number;
  totalWage: number;
}

/** 오늘의 근무 리스트 성공 응답 */
export interface TodayWorkLogsSuccess {
  date: string;
  schedules: TodayWorkLogScheduleItem[];
  totalCount: number;
}

/** 홈 화면 간단 추가 - 요청 (POST /api/schedules) */
export interface CreateScheduleQuickAddBody {
  workplace: string;
  workDate: string;
  startTime: string;
  endTime: string;
  hourlyWage?: number;
  memo?: string;
}

/** 홈 화면 간단 추가 - 성공 응답 */
export interface CreateScheduleQuickAddSuccess {
  scheduleId: string;
  workplace: string;
  workDate: string;
  workTime: string;
  hourlyWage: number;
  estimatedWage: number;
  memo: string;
}
