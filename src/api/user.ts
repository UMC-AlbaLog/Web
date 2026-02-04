import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/**
 * 유저 정보 조회
 * GET /api/user/info
 * - 응답: string (예: 이메일 등)
 */
export async function getUserInfo(): Promise<string | null> {
  try {
    const data = await apiRequest<string | { resultType: string; success: string }>("/api/user/info", {
      method: "GET",
    });
    if (typeof data === "string") return data;
    if (data?.success != null) return String(data.success);
    return null;
  } catch {
    return null;
  }
}

/**
 * 액세스 토큰 재발급
 * GET /api/user/auth/refresh
 * - success: 새 액세스 토큰 문자열
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const data = await apiRequest<TsoaResponse<string>>("/api/user/auth/refresh", { method: "GET" });
    if (data.resultType === "SUCCESS" && typeof data.success === "string") return data.success;
    return null;
  } catch {
    return null;
  }
}

/**
 * 로그아웃
 * GET /api/user/logout
 * - 204 No content
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest<undefined>("/api/user/logout", { method: "GET" });
  } catch {
    // 204 성공 시 body 없음, 실패해도 클라이언트에서 토큰 정리 가능
  }
}
