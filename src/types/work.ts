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
  settlementStatus?: SettlementStatus;
  actualPay?: number; // 실제 수입 (정산 완료 시)
  description: string;
  requirements: string;
  notice: string;
}