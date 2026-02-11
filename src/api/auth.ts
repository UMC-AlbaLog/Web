import { apiRequest } from "./client";

export interface AuthLoginResponse {
  accessToken: string;
}

interface TsoaResponse<T> {
  resultType: "SUCCESS" | "FAIL";
  success?: T;
}

/**
 * 백엔드에 Google ID 토큰을 보내고 JWT(accessToken)를 받습니다.
 */
export async function loginWithGoogle(googleIdToken: string): Promise<AuthLoginResponse | null> {
  try {
    const body = { idToken: googleIdToken };
    const data = await apiRequest<AuthLoginResponse | string>("/auth/google", {
      method: "POST",
      body,
    });
    if (typeof data === "object" && data !== null && typeof (data as AuthLoginResponse).accessToken === "string") {
      return data as AuthLoginResponse;
    }
    if (import.meta.env.DEV) {
      console.warn("[API] 로그인 응답이 accessToken이 아닙니다.", data);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 테스트 유저 액세스 토큰 발급 (개발/테스트용)
 * GET /api/test
 */
export async function getTestAccessToken(): Promise<string | null> {
  try {
    const data = await apiRequest<TsoaResponse<string> | { accessToken?: string } | string>("/api/test", { method: "GET" });
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const tsoa = data as TsoaResponse<string>;
      if (tsoa.resultType === "SUCCESS" && typeof tsoa.success === "string") return tsoa.success;
      const withToken = data as { accessToken?: string };
      if (typeof withToken.accessToken === "string") return withToken.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}
