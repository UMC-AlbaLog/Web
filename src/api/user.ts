import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

/**
 * 사용자 정보 조회
 */
export async function getUserInfo(): Promise<string> {
  const data = await apiRequest<TsoaResponse<string>>("/api/user/info", {
    method: "GET",
  });

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("사용자 정보를 가져올 수 없습니다.");
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await apiRequest("/api/user/logout", {
    method: "GET",
  });
}

/**
 * 테스트용 액세스 토큰 발급 (Swagger 테스트 용)
 */
export async function getTestToken(): Promise<string> {
  const data = await apiRequest<TsoaResponse<string>>("/api/test", {
    method: "GET",
  });

  if (data?.resultType === "SUCCESS" && data.success) {
    // 토큰을 sessionStorage에 저장
    sessionStorage.setItem("accessToken", data.success);
    return data.success;
  }
  throw new Error("테스트 토큰을 가져올 수 없습니다.");
}

