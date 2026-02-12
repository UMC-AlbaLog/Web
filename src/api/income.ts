import api from "./client";

/**
 * GET /income/dashboard?month=YYYY-MM
 */
export const fetchIncomeDashboard = (month: string) => {
  return api.get("/income/dashboard", {
    params: { month },
  });
};
