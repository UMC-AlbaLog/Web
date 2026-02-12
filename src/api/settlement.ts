import api from "./client";

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
  status?: "all" | "waiting" | "paid" | "unpaid";
  sort?: "latest" | "oldest";
  cursor?: string;
  size?: number;
}) => {
  return api.get<SettlementListResponse>(
    "/api/settlement-status-list",
    { params }
  );
};
