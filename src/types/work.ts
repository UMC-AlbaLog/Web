export type WorkStatus = "upcoming" | "working" | "done";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Work {
  id: string;
  name: string;
  address: string;
  time: string;
  duration: number;
  pay: number;
  expectedPay: number;
  status: WorkStatus;
  memo?: string;
  date: string;
  lat?: number;
  lng?: number;
  // 지원 관련 필드
  applicationStatus?: ApplicationStatus;
  appliedDate?: string;
}