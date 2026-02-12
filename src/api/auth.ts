import api from "./client";

/**
 * Swagger: GET /api/test
 * success 필드에 토큰 문자열이 들어옴
 */
export const getTestToken = async (): Promise<string> => {
  const res = await api.get("/api/test");

  if (res.data.resultType !== "SUCCESS" || !res.data.success) {
    throw new Error("토큰 발급 실패");
  }

  return res.data.success; // 👈 이게 토큰
};
