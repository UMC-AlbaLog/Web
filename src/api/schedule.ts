import { apiRequest } from "./client";
import type {
  CreateManualScheduleBody,
  UpdateManualScheduleBody,
  TsoaResponse,
  CreateScheduleQuickAddBody,
  CreateScheduleQuickAddSuccess,
} from "./types";

const SCHEDULE_BASE = "/user/alba/schedule";

function unwrapSuccess<T>(data: TsoaResponse<T>): T | null {
  if (data.resultType === "FAIL" || data.success == null) return null;
  return data.success as T;
}

/**
 * 홈 화면 간단 추가 - 새 알바 일정 추가
 * POST /api/schedules
 * - 근무지, 날짜, 시간, 시급, 메모로 일정 생성
 */
export async function createScheduleQuickAdd(
  body: CreateScheduleQuickAddBody
): Promise<CreateScheduleQuickAddSuccess | null> {
  try {
    const data = await apiRequest<TsoaResponse<CreateScheduleQuickAddSuccess>>("/api/schedules", {
      method: "POST",
      body,
    });
    return unwrapSuccess(data);
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 홈 일정 추가 실패:", e instanceof Error ? e.message : e);
    }
    return null;
  }
}

/**
 * 스케줄 등록 (수동 입력)
 * POST /user/alba/schedule/manual
 * - repeat_type / repeat_days 는 페어로 둘 다 보내거나 둘 다 생략 (400 방지)
 * - 성공 시 201, TsoaResponse.success 에 user_alba_schedule_id
 */
export async function createManualSchedule(
  body: CreateManualScheduleBody
): Promise<{ user_alba_schedule_id: string } | null> {
  try {
    const data = await apiRequest<TsoaResponse<{ user_alba_schedule_id: string }>>(
      `${SCHEDULE_BASE}/manual`,
      { method: "POST", body }
    );
    const success = unwrapSuccess(data);
    return success ? { user_alba_schedule_id: success.user_alba_schedule_id } : null;
  } catch {
    return null;
  }
}

/**
 * 스케줄 등록 (알바 정보 기반)
 * POST /user/alba/schedule/from-alba
 */
export async function createScheduleFromAlba(userWorkLogId: string): Promise<{ user_alba_schedule_id: string } | null> {
  const data = await apiRequest<TsoaResponse<{ user_alba_schedule_id: string }>>(
    `${SCHEDULE_BASE}/from-alba`,
    { method: "POST", body: { user_work_log_id: userWorkLogId } }
  );
  const success = unwrapSuccess(data);
  return success ? { user_alba_schedule_id: success.user_alba_schedule_id } : null;
}

/**
 * 스케줄 수정
 * PATCH /user/alba/schedule/{userAlbaScheduleId}
 * - success 는 문자열(user_alba_schedule_id) 반환
 */
export async function updateSchedule(
  userAlbaScheduleId: string,
  body: UpdateManualScheduleBody
): Promise<{ user_alba_schedule_id: string } | null> {
  const data = await apiRequest<TsoaResponse<string>>(
    `${SCHEDULE_BASE}/${encodeURIComponent(userAlbaScheduleId)}`,
    { method: "PATCH", body }
  );
  const success = unwrapSuccess(data);
  return typeof success === "string" ? { user_alba_schedule_id: success } : null;
}

/**
 * 스케줄 삭제
 * DELETE /user/alba/schedule/{userAlbaScheduleId}
 * - success 는 문자열(user_alba_schedule_id) 반환
 */
export async function deleteSchedule(userAlbaScheduleId: string): Promise<{ user_alba_schedule_id: string } | null> {
  const data = await apiRequest<TsoaResponse<string>>(
    `${SCHEDULE_BASE}/${encodeURIComponent(userAlbaScheduleId)}`,
    { method: "DELETE" }
  );
  const success = unwrapSuccess(data);
  return typeof success === "string" ? { user_alba_schedule_id: success } : null;
}
