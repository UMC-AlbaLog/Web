import { apiRequest } from "./client";
import type { TsoaResponse, TodayWorkLogsSuccess } from "./types";

function unwrapSuccess<T>(data: TsoaResponse<T>): T | null {
  if (data.resultType === "FAIL" || data.success == null) return null;
  return data.success as T;
}

/**
 * 오늘의 근무 리스트 조회
 * GET /api/work-logs/today
 */
export async function getTodayWorkLogs(): Promise<TodayWorkLogsSuccess | null> {
  try {
    const data = await apiRequest<TsoaResponse<TodayWorkLogsSuccess>>(
      "/api/work-logs/today",
      { method: "GET" }
    );
    return unwrapSuccess(data);
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[API] 오늘 근무 조회 실패:", e instanceof Error ? e.message : e);
    }
    return null;
  }
}
