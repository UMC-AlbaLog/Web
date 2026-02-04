import { apiRequest } from "./client";
import type {
  SettlementStatusListResponse,
  SettlementStatusFilter,
  SettlementSort,
  TsoaResponse,
  IncomeDashboardSuccess,
} from "./types";

/**
 * 정산 상태 목록 조회
 * GET /api/settlement-status-list
 * - 401 시 HTTP status 우선 기준으로 인증 실패 처리, body는 { items: [], hasNext: false } 형태일 수 있음
 */
export async function getSettlementStatusList(params?: {
  status?: SettlementStatusFilter;
  sort?: SettlementSort;
  cursor?: string;
  size?: number;
}): Promise<SettlementStatusListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.size != null) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  const path = `/api/settlement-status-list${query ? `?${query}` : ""}`;
  return apiRequest<SettlementStatusListResponse>(path);
}

/**
 * 수입 대시보드 조회
 * GET /income/dashboard?month=YYYY-MM
 * - resultType 먼저 확인 후 success 사용
 */
export async function getIncomeDashboard(month?: string): Promise<IncomeDashboardSuccess | null> {
  const path = month ? `/income/dashboard?month=${encodeURIComponent(month)}` : "/income/dashboard";
  const data = await apiRequest<TsoaResponse<IncomeDashboardSuccess>>(path);
  if (data.resultType === "FAIL" || data.success == null) {
    return null;
  }
  return data.success;
}
