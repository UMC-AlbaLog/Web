import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/**
 * GET /api/alba/status 응답 success 항목 한 건
 * - 가게명, 근무날짜, 근무요일, 시작시간, 종료시간, 진행상태(대기중/지원승인/지원거절)
 * - id / jobId: 상세보기 링크용 (있으면 /jobs/:id 로 이동)
 */
export interface AlbaStatusItem {
  storeName: string;
  workDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  processStatus: string;
  /** 일자리(공고) ID - 상세보기 링크용 */
  id?: string;
  jobId?: string;
}

export type AlbaStatusType = "all" | "active" | "closed";

/**
 * 아르바이트 지원 현황 조회 (토큰 인증)
 * GET /api/alba/status?type=all|active|closed
 * - 전체(all), 진행중(active: 승인/거절 전), 모집완료(closed: 승인·거절 완료)
 * - Authorization 헤더에 accessToken 필요 (client에서 자동 첨부)
 */
function normalizeAlbaStatusItem(raw: Record<string, unknown>): AlbaStatusItem {
  return {
    storeName: String(raw.storeName ?? raw.store_name ?? ""),
    workDate: String(raw.workDate ?? raw.work_date ?? ""),
    dayOfWeek: String(raw.dayOfWeek ?? raw.day_of_week ?? ""),
    startTime: String(raw.startTime ?? raw.start_time ?? ""),
    endTime: String(raw.endTime ?? raw.end_time ?? ""),
    processStatus: String(raw.processStatus ?? raw.process_status ?? ""),
    id: raw.id != null ? String(raw.id) : undefined,
    jobId: raw.jobId != null ? String(raw.jobId) : raw.job_id != null ? String(raw.job_id) : undefined,
  };
}

export async function getAlbaStatus(
  type: AlbaStatusType = "all"
): Promise<AlbaStatusItem[]> {
  const data = await apiRequest<TsoaResponse<AlbaStatusItem[] | Record<string, unknown>[]>>(
    `/api/alba/status?type=${type}`,
    { method: "GET" }
  );
  if (data?.resultType !== "SUCCESS" || data.success == null) return [];
  const rawList = Array.isArray(data.success) ? data.success : [];
  return rawList
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map(normalizeAlbaStatusItem);
}
