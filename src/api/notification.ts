import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/** 알림 타입: 근무시간 | 근무승인 | 급여 */
export type NotificationType = "work_time" | "work_approve" | "payment";

/** 알림 한 건 (목록 조회 / 생성 응답) */
export interface NotificationItem {
  userId: string;
  message: string;
  type: NotificationType;
  notificationId: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 알림 생성 요청 body */
export interface CreateNotificationBody {
  userId: string;
  message: string;
  type: NotificationType;
}

/**
 * 알림 생성
 * POST /api/notification/new
 */
export async function createNotification(
  body: CreateNotificationBody
): Promise<NotificationItem | null> {
  try {
    const data = await apiRequest<TsoaResponse<NotificationItem>>("/api/notification/new", {
      method: "POST",
      body,
    });
    if (data?.resultType === "SUCCESS" && data.success) return data.success;
    return null;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 알림 생성 실패:", e instanceof Error ? e.message : e);
    }
    return null;
  }
}

/**
 * 유저 알림 목록 조회
 * POST /api/notification/get
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const data = await apiRequest<TsoaResponse<NotificationItem[]>>("/api/notification/get", {
      method: "POST",
    });
    if (data?.resultType === "SUCCESS" && Array.isArray(data.success)) return data.success;
    return [];
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 알림 목록 조회 실패:", e instanceof Error ? e.message : e);
    }
    return [];
  }
}

/**
 * 알림 하나 삭제
 * DELETE /api/notification/delete?notification_id={uuid}
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const path = `/api/notification/delete?notification_id=${encodeURIComponent(notificationId)}`;
    await apiRequest<TsoaResponse<string>>(path, { method: "DELETE" });
    return true;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 알림 삭제 실패:", e instanceof Error ? e.message : e);
    }
    return false;
  }
}

/**
 * 모든 알림 삭제
 * DELETE /api/notification/deleteAll
 */
export async function deleteAllNotifications(): Promise<boolean> {
  try {
    await apiRequest<TsoaResponse<number>>("/api/notification/deleteAll", {
      method: "DELETE",
    });
    return true;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 알림 전체 삭제 실패:", e instanceof Error ? e.message : e);
    }
    return false;
  }
}
