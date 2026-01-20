export type NotificationType = "approval" | "reminder" | "settlement";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content?: string;
  amount?: number;
  date: string; // YYYY-MM-DD 형식
  timestamp: string; // 상대 시간 표시용 (예: "10시간 전")
  createdAt: number; // 정렬용 timestamp
}

