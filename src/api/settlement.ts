import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

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

export type SettlementStatus = "all" | "waiting" | "paid" | "unpaid";

/**
 * 계좌 정보 조회
 */
export async function getSettlement(userId: string): Promise<SettlementInfo> {
  const data = await apiRequest<TsoaResponse<SettlementInfo>>(
    `/api/users/${userId}/settlement`,
    {
      method: "GET",
    }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("계좌 정보를 가져올 수 없습니다.");
}

/**
 * 계좌 정보 수정
 */
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

/**
 * 정산 내역 조회
 */
export async function getSettlementHistory(
  userId: string,
  status: SettlementStatus = "all"
): Promise<SettlementHistoryResponse> {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.append("status", status);
  }
  
  const queryString = params.toString();
  const path = `/api/settlement-history/${userId}${queryString ? `?${queryString}` : ""}`;
  
  const data = await apiRequest<TsoaResponse<SettlementHistoryResponse>>(
    path,
    {
      method: "GET",
    }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("정산 내역을 가져올 수 없습니다.");
}

