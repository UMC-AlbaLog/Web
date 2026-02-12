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

  // 특정 유저의 프로필 조회
  getUserProfile: async (userId: string) => {
    const data = await apiRequest<TsoaResponse<any>>(
      `/api/profile/${userId}`, 
      { method: "GET" }
    );
    
    return data?.resultType === "SUCCESS" ? data.success : null;
  }
};