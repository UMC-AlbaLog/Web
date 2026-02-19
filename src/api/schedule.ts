import { apiRequest } from "./client";
import type { ScheduleItem, Workplace } from "../types/schedule";

/**
 * repeat_days: MON~SUN 순서 7자리 0/1 문자열.
 * repeatDays는 JS getDay() (0=일, 1=월, ..., 6=토) → 위치 0=MON, 1=TUE, ..., 6=SUN.
 */
const MON_TO_SUN_JS_DAY = [1, 2, 3, 4, 5, 6, 0]; // MON=1, TUE=2, ..., SUN=0

function toRepeatDaysString(repeatDays: number[]): string {
  return MON_TO_SUN_JS_DAY.map((jsDay) => (repeatDays.includes(jsDay) ? "1" : "0")).join("");
}

/**
 * POST /user/alba/schedule/manual 요청 body
 * - day_of_week: 보내지 않음 (백엔드 변경)
 * - repeat_days: weekly/biweekly일 때만, MON~SUN 7자리 0/1 문자열. daily/none이면 미포함.
 */
export interface CreateManualScheduleBody {
  workplace: string;
  work_date: string;
  work_time: string;
  hourly_wage: number;
  memo: string;
  /** weekly/biweekly일 때만 포함. daily/none이면 생략 */
  repeat_type?: "daily" | "weekly" | "biweekly";
  repeat_days?: string;
}

/** ScheduleItem → API 요청 body 변환 */
function toCreateManualBody(item: Partial<ScheduleItem>): CreateManualScheduleBody & Record<string, unknown> {
  const date = item.date ?? new Date().toISOString().slice(0, 10);
  const repeatType = item.repeatType ?? "none";
  const workTime =
    item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : "09:00-18:00";
  const body: CreateManualScheduleBody & Record<string, unknown> = {
    workplace: String(item.workplaceId ?? ""),
    work_date: date,
    work_time: workTime,
    hourly_wage: Number(item.hourlyWage ?? 0),
    memo: String(item.memo ?? ""),
  };
  if (repeatType !== "none") {
    body.repeat_type = repeatType;
    if (repeatType === "weekly" || repeatType === "biweekly") {
      const days = Array.isArray(item.repeatDays) && item.repeatDays.length > 0 ? item.repeatDays : [];
      body.repeat_days = toRepeatDaysString(days);
    }
  }
  return body;
}

/** PATCH /user/alba/schedule/{id} - 변경 필드만 snake_case. day_of_week 미전송. repeat_days는 weekly/biweekly일 때만 MON~SUN 7자리 0/1 */
function toUpdateManualBody(updates: Partial<ScheduleItem>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (updates.workplaceId !== undefined) body.workplace = String(updates.workplaceId);
  if (updates.date !== undefined) body.work_date = updates.date;
  if (updates.startTime !== undefined && updates.endTime !== undefined) {
    body.work_time = `${updates.startTime}-${updates.endTime}`;
  }
  if (updates.hourlyWage !== undefined) body.hourly_wage = Number(updates.hourlyWage);
  if (updates.memo !== undefined) body.memo = String(updates.memo);
  if (updates.repeatType !== undefined || updates.repeatDays !== undefined) {
    const repeatType = updates.repeatType ?? "none";
    body.repeat_type = repeatType;
    if (repeatType === "weekly" || repeatType === "biweekly") {
      const days = Array.isArray(updates.repeatDays) ? updates.repeatDays : [];
      body.repeat_days = toRepeatDaysString(days);
    }
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

/** API 응답 한 건을 ScheduleItem으로 정규화 (snake_case → camelCase, work_time 분리) */
function normalizeScheduleItem(raw: Record<string, unknown>): ScheduleItem {
  const id = String(raw.id ?? raw.user_alba_schedule_id ?? "");
  const date =
    String(raw.date ?? raw.work_date ?? "").slice(0, 10) ||
    new Date().toISOString().slice(0, 10);
  const workTime = String(raw.work_time ?? `${raw.startTime ?? ""}-${raw.endTime ?? ""}`).trim();
  const [startTime = "09:00", endTime = "18:00"] = workTime
    ? workTime.split("-").map((s) => s.trim().slice(0, 5))
    : ["09:00", "18:00"];
  // API는 workplace를 장소 이름(문자열)으로만 줌 → scheduleName에 넣고, workplaceId는 이름으로 둠(매칭용)
  const workplaceFromApi = String(raw.workplace ?? raw.workplaceId ?? "");
  const workplaceId = String(raw.workplaceId ?? raw.workplace ?? "");
  const scheduleName = raw.scheduleName != null ? String(raw.scheduleName) : workplaceFromApi || undefined;
  const repeatType = (raw.repeat_type ?? raw.repeatType) as ScheduleItem["repeatType"] | undefined;
  let repeatDays: number[] | undefined;
  if (Array.isArray(raw.repeatDays)) repeatDays = raw.repeatDays as number[];
  else if (typeof raw.repeat_days === "string" && raw.repeat_days.length >= 7) {
    repeatDays = raw.repeat_days
      .slice(0, 7)
      .split("")
      .reduce<number[]>((acc, c, i) => (c === "1" ? [...acc, MON_TO_SUN_JS_DAY[i]] : acc), []);
  }
  return {
    id,
    workplaceId,
    date,
    startTime: startTime.length === 5 ? startTime : "09:00",
    endTime: endTime.length === 5 ? endTime : "18:00",
    hourlyWage: typeof raw.hourly_wage === "number" ? raw.hourly_wage : (raw.hourlyWage as number | undefined),
    memo: raw.memo as string | undefined,
    ...(scheduleName && { scheduleName }),
    ...(raw.scheduleType != null && { scheduleType: raw.scheduleType as ScheduleItem["scheduleType"] }),
    ...(raw.salaryType != null && { salaryType: raw.salaryType as ScheduleItem["salaryType"] }),
    ...(repeatType != null && { repeatType }),
    ...(repeatDays != null && repeatDays.length > 0 && { repeatDays }),
  } as ScheduleItem;
}

/**
 * 스케줄 목록 조회
 * GET /user/alba/schedule?month=YYYY-MM (예: month=2026-02)
 * @param params.month 조회 월 (YYYY-MM). 생략 시 이번 달.
 */
export async function getSchedules(params?: { month?: string }): Promise<ScheduleItem[]> {
  try {
    const now = new Date();
    const month = params?.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const path = `/user/alba/schedule?month=${encodeURIComponent(month)}`;
    const data = await apiRequest<{ resultType?: string; success?: { schedules?: unknown[] } | unknown[] }>(path, { method: "GET" });
    let rawList: unknown[] = [];
    if (data && typeof data === "object") {
      const s = (data as { success?: { schedules?: unknown[] } | unknown[] }).success;
      if (s && typeof s === "object" && !Array.isArray(s) && Array.isArray((s as { schedules?: unknown[] }).schedules)) {
        rawList = (s as { schedules: unknown[] }).schedules;
      } else if (Array.isArray(s)) {
        rawList = s;
      }
    }
    if (Array.isArray(data)) rawList = data as unknown[];
    const list = rawList
      .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
      .map((item) => normalizeScheduleItem(item));
    if (import.meta.env.DEV) {
      console.log("[API] 스케줄 목록 조회 성공", { month, count: list.length, path });
    }
    return list;
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
 * @param id userAlbaScheduleId (path parameter)
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
