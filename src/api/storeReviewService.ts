import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

export interface ReviewCreateRequest {
  storeId: string;
  kindness: number;
  communication: number;
  settlement: number;
  rest: number;
  review: string;
}

export const storeReviewService = {
  // 근무지 평가 조회
  getStoreReviews: async (storeId: string) => {
    const data = await apiRequest<TsoaResponse<any> | any>(`/api/store/review/${storeId}`);
    return data?.success?.reviews || data?.reviews || [];
  },

  // 근무지 평가 등록
  createReview: async (body: ReviewCreateRequest) => {
    return await apiRequest("/api/store/review", {
      method: "POST",
      body,
    });
  },
};