import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

export const userService = {
  // 내 정보 조회
  getUserInfo: async () => {
    const data = await apiRequest<TsoaResponse<any>>(
      '/api/user/info', 
      { method: "GET" }
    );
    
    return data?.resultType === "SUCCESS" ? data.success : null;
  },

  // 내 프로필 조회 (현재 사용되지 않음 - profile.ts의 getProfile 사용 권장)
  getUserProfile: async () => {
    const data = await apiRequest<TsoaResponse<any>>(
      `/api/profile/me`, 
      { method: "GET" }
    );
    
    return data?.resultType === "SUCCESS" ? data.success : null;
  }
};