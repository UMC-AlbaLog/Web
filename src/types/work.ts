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
  memo: string;
  date: string;
  lat?: number;
  lng?: number;
  applicationStatus?: ApplicationStatus;
  appliedDate?: string;
  description: string;
  requirements: string;
  notice: string;
}