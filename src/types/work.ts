export type WorkStatus = "upcoming" | "working" | "done";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type SettlementStatus = "pending" | "completed";

export interface Work {
  id: string;
  name: string;
  address: string;
  time: string;
  duration: number;
  pay: number;
  expectedPay: number;
  status: WorkStatus;
  memo: string;
  date: string;
  lat?: number;
  lng?: number;
  applicationStatus?: ApplicationStatus;
  appliedDate?: string;
  description: string;
  requirements: string;
  notice: string;
  /** 정산 상태 (수입 화면용) */
  settlementStatus?: SettlementStatus;
  /** 실제 수입 (수입 화면용) */
  actualPay?: number;
}