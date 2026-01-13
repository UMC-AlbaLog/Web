export type WorkStatus = "upcoming" | "working" | "done";

export interface Work {
  id: number;
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
}