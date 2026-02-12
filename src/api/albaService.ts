import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

export interface AlbaSearchParams {
  workDate?: string;
  storeCategory?: string;
  storeName?: string;
  workTime?: string;
  hourlyRate?: number;
}

export const albaService = {
  // 알바 리스트 조회 (필터 적용)
  getAlbaList: async (params: AlbaSearchParams) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>);

    const query = new URLSearchParams(cleanParams).toString();
    
    const data = await apiRequest<TsoaResponse<any[]> | any[]>(
      `/api/alba/search?${query}`, 
      { method: "GET" }
    );

    if (data && typeof data === 'object' && 'resultType' in data && data.resultType === "SUCCESS") {
      return data.success || [];
    }
    
    if (Array.isArray(data)) return data;
    
    return [];
  },

  // 대타 공고 상세 정보 조회
  getAlbaDetail: async (albaId: string) => {
    const data = await apiRequest<TsoaResponse<any> | any>(
      `/api/alba/application/${albaId}`, 
      { method: "GET" }
    );
    if (data && typeof data === 'object' && 'resultType' in data && data.resultType === "SUCCESS") {
      return data.success;
    }
    return data || null;
  },

  // 대타 아르바이트 지원
  applyAlba: async (albaId: string) => {
    return await apiRequest<TsoaResponse<any>>(`/api/alba/application`, {
      method: "POST",
      body: { albaId } 
    });
  },

  updateApplicationStatus: async (albaId: string, status: "approved" | "rejected") => {
    return await apiRequest(`/api/alba/application/status`, {
      method: "PUT",
      body: { albaId, status }
    });
  },

  // 리뷰 등록
  createReview: async (reviewData: {
    userId: string;
    storeId: string;
    kindness: number;
    communication: number;
    settlement: number;
    rest: number;
    review: string;
  }) => {
    return await apiRequest(`/api/store/review`, {
      method: "POST",
      body: reviewData
    });
  }
  
};