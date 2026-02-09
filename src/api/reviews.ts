import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/**
 * 리뷰 응답 타입 (백엔드 success 배열 요소)
 */
export interface ReviewItem {
  reviewId: string;
  storeName: string;
  content: string;
  rating: number;
  createdAt?: string;
  [key: string]: any;
}

/**
 * 리뷰 수정 요청 타입
 */
export interface UpdateReviewRequest {
  content: string;
  rating: number;
}

/**
 * 사용자 리뷰 목록 조회
 * @param userId 사용자 ID
 */
export async function getUserReviews(userId: string): Promise<ReviewItem[]> {
  const data = await apiRequest<TsoaResponse<ReviewItem[]>>(
    `/api/users/${userId}/reviews`,
    {
      method: "GET",
    }
  );

  if (data?.resultType === "SUCCESS" && Array.isArray(data.success)) {
    return data.success;
  }
  return [];
}

/**
 * 리뷰 수정
 * @param userId 사용자 ID
 * @param reviewId 리뷰 ID
 * @param reviewData 수정할 리뷰 데이터
 */
export async function updateReview(
  userId: string,
  reviewId: string,
  reviewData: UpdateReviewRequest
): Promise<ReviewItem> {
  const data = await apiRequest<TsoaResponse<ReviewItem>>(
    `/api/users/${userId}/reviews/${reviewId}`,
    {
      method: "PUT",
      body: reviewData,
    }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("리뷰 수정에 실패했습니다.");
}

/**
 * 리뷰 삭제
 * @param userId 사용자 ID
 * @param reviewId 리뷰 ID
 */
export async function deleteReview(
  userId: string,
  reviewId: string
): Promise<void> {
  const data = await apiRequest<TsoaResponse<void>>(
    `/api/users/${userId}/reviews/${reviewId}`,
    {
      method: "DELETE",
    }
  );

  if (data?.resultType === "SUCCESS") {
    return;
  }
  throw new Error("리뷰 삭제에 실패했습니다.");
}

