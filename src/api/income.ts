import api from "./client";

/**
 * GET /api/income/dashboard?month=YYYY-MM
 * Swagger: 수입 대시보드 조회 (month 생략 시 이번 달)
 */
export const fetchIncomeDashboard = (month: string) => {
  return api.get("/api/income/dashboard", {
    params: { month },
  });
};
