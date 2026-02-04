import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/**
 * 백엔드에 Google ID 토큰을 보내고 JWT(accessToken)를 받습니다.
 * 백엔드 라우트/body 형식에 맞게 path, body 수정 가능.
 */
export interface AuthLoginResponse {
  accessToken: string;
  /** 필요 시 refreshToken 등 추가 */
}

export async function loginWithGoogle(googleIdToken: string): Promise<AuthLoginResponse | null> {
  try {
    const body: { idToken: string } = { idToken: googleIdToken };
    const data = await apiRequest<AuthLoginResponse | string>("/auth/google", {
      method: "POST",
      body,
    });
    if (typeof data === "object" && data !== null && typeof (data as AuthLoginResponse).accessToken === "string") {
      return data as AuthLoginResponse;
    }
    if (import.meta.env.DEV) {
      console.warn("[API] 로그인 응답이 accessToken이 아닙니다. 백엔드가 JWT를 반환하는지 확인하세요.", data);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 테스트 유저 액세스 토큰 발급 (Swagger/개발용)
 * GET /api/test
 */
export async function getTestAccessToken(): Promise<string | null> {
  try {
    const data = await apiRequest<TsoaResponse<string>>("/api/test", { method: "GET" });
    if (data.resultType === "SUCCESS" && typeof data.success === "string") return data.success;
    return null;
  } catch {
    return null;
  }
}
