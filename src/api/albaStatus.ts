import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/**
 * GET /api/alba/status 응답 success 항목 한 건
 * - 가게명, 근무날짜, 근무요일, 시작시간, 종료시간, 진행상태(대기중/지원승인/지원거절)
 */
export interface AlbaStatusItem {
  storeName: string;
  workDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  processStatus: string;
}

export type AlbaStatusType = "all" | "active" | "closed";

/**
 * 아르바이트 지원 현황 조회 (토큰 인증)
 * GET /api/alba/status?type=all|active|closed
 * - 전체(all), 진행중(active: 승인/거절 전), 모집완료(closed: 승인·거절 완료)
 * - Authorization 헤더에 accessToken 필요 (client에서 자동 첨부)
 */
export async function getAlbaStatus(
  type: AlbaStatusType = "all"
): Promise<AlbaStatusItem[]> {
  const data = await apiRequest<TsoaResponse<AlbaStatusItem[]>>(
    `/api/alba/status?type=${type}`,
    { method: "GET" }
  );
  if (data?.resultType === "SUCCESS" && Array.isArray(data.success)) {
    return data.success;
  }
  return [];
}
