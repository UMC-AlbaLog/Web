import { apiRequest } from "./client";
import type { ScheduleItem, Workplace } from "../types/schedule";

const DAY_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

/**
 * POST /user/alba/schedule/manual 요청 body
 * - repeat_type/repeat_days: 반복할 때만 포함 (백엔드: "repeat_type이 있으면 repeat_days가 필요")
 * - repeat_type이 "none"이면 두 필드 모두 생략
 */
export interface CreateManualScheduleBody {
  workplace: string;
  work_date: string;
  work_time: string;
  day_of_week: "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
  hourly_wage: number;
  memo: string;
  /** 반복할 때만 포함 (none이면 생략) */
  repeat_type?: "daily" | "weekly" | "biweekly";
  repeat_days?: string;
}

/** ScheduleItem → API 요청 body 변환. repeat_type이 none이면 repeat_* 필드 미포함 */
function toCreateManualBody(item: Partial<ScheduleItem>): CreateManualScheduleBody & Record<string, unknown> {
  const date = item.date ?? new Date().toISOString().slice(0, 10);
  const dayIndex = new Date(date + "T12:00:00").getDay();
  const repeatType = item.repeatType ?? "none";
  const workTime =
    item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : "09:00-18:00";
  const body: CreateManualScheduleBody & Record<string, unknown> = {
    workplace: String(item.workplaceId ?? ""),
    work_date: date,
    work_time: workTime,
    day_of_week: DAY_OF_WEEK[dayIndex],
    hourly_wage: Number(item.hourlyWage ?? 0),
    memo: String(item.memo ?? ""),
  };
  if (repeatType !== "none") {
    body.repeat_type = repeatType;
    body.repeat_days = Array.isArray(item.repeatDays) && item.repeatDays.length > 0
      ? item.repeatDays.join(",")
      : "";
  }
  return body;
}

/** PATCH /user/alba/schedule/{id} - 변경 필드만 snake_case로 전송. repeat_type/repeat_days는 쌍으로 */
function toUpdateManualBody(updates: Partial<ScheduleItem>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (updates.workplaceId !== undefined) body.workplace = String(updates.workplaceId);
  if (updates.date !== undefined) {
    body.work_date = updates.date;
    const dayIndex = new Date(updates.date + "T12:00:00").getDay();
    body.day_of_week = DAY_OF_WEEK[dayIndex];
  }
  if (updates.startTime !== undefined && updates.endTime !== undefined) {
    body.work_time = `${updates.startTime}-${updates.endTime}`;
  }
  if (updates.hourlyWage !== undefined) body.hourly_wage = Number(updates.hourlyWage);
  if (updates.memo !== undefined) body.memo = String(updates.memo);
  if (updates.repeatType !== undefined || updates.repeatDays !== undefined) {
    body.repeat_type = updates.repeatType ?? "none";
    body.repeat_days =
      updates.repeatType !== "none" && Array.isArray(updates.repeatDays)
        ? updates.repeatDays.join(",")
        : "";
  }
  return body;
}

/** ITsoaResponse 성공: resultType SUCCESS, success 안에 결과 */
interface ScheduleSuccessResponse {
  resultType: "SUCCESS";
  success: { user_alba_schedule_id?: string; id?: string } | string;
  error: null;
}

/** 문자열에서 UUID만 추출 (URL·경로가 붙어 와도 마지막 UUID 반환) */
function extractUuid(value: string | null | undefined): string | null {
  if (value == null || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = trimmed.match(uuidRegex);
  return match ? match[0] : null;
}

/**
 * 스케줄 목록 조회 (백엔드에 GET 목록 API가 있으면 경로만 맞추면 됨)
 */
export async function getSchedules(_params?: { start?: string; end?: string }): Promise<ScheduleItem[]> {
  try {
    const data = await apiRequest<ScheduleItem[] | { items: ScheduleItem[] }>("/user/alba/schedule", { method: "GET" });
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    return [];
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 스케줄 목록 조회 실패:", e instanceof Error ? e.message : e);
    }
    return [];
  }
}

/**
 * 스케줄 등록 (수동 입력)
 * POST /user/alba/schedule/manual
 * JWT 필요. 201 시 success.user_alba_schedule_id 반환.
 */
export async function createSchedule(body: Omit<ScheduleItem, "id"> & { id?: string }): Promise<ScheduleItem | null> {
  try {
    const apiBody = toCreateManualBody(body);
    if (import.meta.env.DEV) {
      console.log("[API] POST /user/alba/schedule/manual 요청 body:", apiBody);
    }
    const res = await apiRequest<ScheduleSuccessResponse>("/user/alba/schedule/manual", {
      method: "POST",
      body: apiBody,
    });
    const success = res?.success;
    let newId: string | null = null;
    if (typeof success === "object" && success != null) {
      newId = extractUuid(success.user_alba_schedule_id) ?? extractUuid(success.id);
    } else if (typeof success === "string") {
      newId = extractUuid(success);
    }
    if (!newId) return null;
    return {
      ...body,
      id: newId,
    } as ScheduleItem;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 스케줄 생성 실패:", e instanceof Error ? e.message : e);
    }
    return null;
  }
}

/**
 * 스케줄 등록 (알바 정보 기반)
 * POST /user/alba/schedule/from-alba
 * body: { user_work_log_id }. 201 시 success.user_alba_schedule_id.
 */
export async function createScheduleFromAlba(userWorkLogId: string): Promise<ScheduleItem | null> {
  try {
    const res = await apiRequest<ScheduleSuccessResponse>("/user/alba/schedule/from-alba", {
      method: "POST",
      body: { user_work_log_id: userWorkLogId },
    });
    const success = res?.success;
    const newId = typeof success === "object" && success?.user_alba_schedule_id ? success.user_alba_schedule_id : typeof success === "string" ? success : null;
    if (!newId) return null;
    return { id: newId, workplaceId: "", date: "", startTime: "", endTime: "" } as ScheduleItem;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 스케줄(알바기반) 생성 실패:", e instanceof Error ? e.message : e);
    }
    return null;
  }
}

/**
 * 스케줄 수정
 * PATCH /user/alba/schedule/{userAlbaScheduleId}
 * body는 바꿀 필드만. repeat_type/repeat_days는 쌍으로만 전송.
 */
export async function updateSchedule(id: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem | null> {
  try {
    const apiBody = toUpdateManualBody(updates);
    if (import.meta.env.DEV) {
      console.log("[API] PATCH /user/alba/schedule/" + id + " 요청 body:", apiBody);
    }
    const res = await apiRequest<ScheduleSuccessResponse>(`/user/alba/schedule/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: apiBody,
    });
    const success = res?.success;
    const returnedId = typeof success === "object" && success?.user_alba_schedule_id ? success.user_alba_schedule_id : typeof success === "string" ? success : id;
    return { ...updates, id: returnedId } as ScheduleItem;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 스케줄 수정 실패:", e instanceof Error ? e.message : e);
    }
    return null;
  }
}

/**
 * 스케줄 삭제
 * DELETE /user/alba/schedule/{userAlbaScheduleId}
 * 200 시 success에 삭제된 user_alba_schedule_id.
 */
export async function deleteSchedule(id: string): Promise<boolean> {
  try {
    await apiRequest<ScheduleSuccessResponse>(`/user/alba/schedule/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 스케줄 삭제 실패:", e instanceof Error ? e.message : e);
    }
    return false;
  }
}

/**
 * 작업장 목록 조회 (백엔드에 해당 API가 있으면 경로만 맞추면 됨)
 */
export async function getWorkplaces(): Promise<Workplace[]> {
  try {
    const data = await apiRequest<Workplace[] | { items: Workplace[] }>("/api/workplaces", { method: "GET" });
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    return [];
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 작업장 목록 조회 실패:", e instanceof Error ? e.message : e);
    }
    return [];
  }
}

export async function createWorkplace(body: Workplace): Promise<Workplace | null> {
  try {
    const res = await apiRequest<Workplace>("/api/workplaces", { method: "POST", body });
    return res ?? null;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 작업장 생성 실패:", e instanceof Error ? e.message : e);
    }
    return null;
  }
}
