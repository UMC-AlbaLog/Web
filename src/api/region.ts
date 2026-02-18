import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

/* ============================= */
/* 지역 검색 */
/* ============================= */

export interface RegionItem {
  region_id: number;
  city: string;
  district: string;
}

export async function searchRegion(query: string): Promise<RegionItem[]> {
  const data = await apiRequest<TsoaResponse<RegionItem[]>>(
    `/api/region/search?query=${encodeURIComponent(query)}`,
    { method: "GET" }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }

  throw new Error("지역 검색 실패");
}

/* ============================= */
/* 선호 지역 저장 */
/* ============================= */

export async function saveUserRegion(regionId: number): Promise<void> {
  const data = await apiRequest<TsoaResponse<{ region_id: number[] }>>(
    `/api/user/auth/region`,
    {
      method: "POST",
      body: {
        regionCode: [regionId],
      },
    }
  );

  if (data?.resultType !== "SUCCESS") {
    throw new Error("지역 저장 실패");
  }
}
