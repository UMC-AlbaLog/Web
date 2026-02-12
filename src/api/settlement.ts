import api from "./client";
import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/* ============================= */
/* 공통 타입 */
/* ============================= */

export type SettlementStatus = "all" | "waiting" | "paid" | "unpaid";

/* ============================= */
/* 1️⃣ 정산 리스트 (기존 feature 브랜치 기) */
/* ============================= */

export interface SettlementItem {
  work_date: string;
  store_name: string;
  work_minutes: number;
  expected_income: number;
  amount: number;
  settlement_status: "waiting" | "paid" | "unpaid";
}

export interface SettlementListResponse {
  items: SettlementItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export const fetchSettlementList = (params?: {
  status?: SettlementStatus;
  sort?: "latest" | "oldest";
  cursor?: string;
  size?: number;
}) => {
  return api.get<SettlementListResponse>(
    "/api/settlement-status-list",
    { params }
  );
};

/* ============================= */
/* 2️⃣ 계좌 정보 조회/수정 (main 브랜치 기능) */
/* ============================= */

export interface SettlementInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface UpdateSettlementRequest {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export async function getSettlement(
  userId: string
): Promise<SettlementInfo> {
  const data = await apiRequest<TsoaResponse<SettlementInfo>>(
    `/api/users/${userId}/settlement`,
    { method: "GET" }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("계좌 정보를 가져올 수 없습니다");
}

export async function updateSettlement(
  userId: string,
  settlementData: UpdateSettlementRequest
): Promise<SettlementInfo> {
  const data = await apiRequest<TsoaResponse<SettlementInfo>>(
    `/api/users/${userId}/settlement`,
    {
      method: "PUT",
      body: settlementData,
    }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("계좌 정보 수정에 실패했습니다.");
}

/* ============================= */
/* 3️⃣ 정산 히스토리 조회 */
/* ============================= */

export interface SettlementHistoryItem {
  workDate: string;
  storeName: string;
  workMinutes: number;
  expectedIncome: number;
  actualIncome: number;
  settlementStatus: string;
}

export interface SettlementHistoryResponse {
  settlements: SettlementHistoryItem[];
  totalExpectedIncome: number;
  totalActualIncome: number;
}

export async function getSettlementHistory(
  userId: string,
  status: SettlementStatus = "all"
): Promise<SettlementHistoryResponse> {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.append("status", status);
  }

  const queryString = params.toString();
  const path =
    `/api/settlement-history/${userId}` +
    (queryString ? `?${queryString}` : "");

  const data = await apiRequest<TsoaResponse<SettlementHistoryResponse>>(
    path,
    { method: "GET" }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }

  throw new Error("정산 내역을 가져올 수 없습니다.");
}
