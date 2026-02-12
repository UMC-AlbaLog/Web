import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

// API 응답 타입 정의 (Swagger 기준)
export interface PlaceItem {
  id: string;
  placeName: string;
  categoryName: string;
  phone: string;
  addressName: string;
  roadAddressName: string;
  x: string;
  y: string;
  placeUrl: string;
  distance: string;
}

export interface SearchPlaceResponse {
  totalCount: number;
  pageableCount: number;
  isEnd: boolean;
  places: PlaceItem[];
}

// UI에서 사용할 Place 타입 (기존 호환성 유지)
export interface Place {
  id?: string;
  name: string;
  address: string;
  region?: string;
  category?: string;
  [key: string]: any;
}

/**
 * 장소 검색
 * @param query 검색할 장소명 (필수)
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query || !query.trim()) {
    throw new Error("검색어가 필요합니다.");
  }

  const path = `/api/places/search?query=${encodeURIComponent(query.trim())}`;

  const data = await apiRequest<TsoaResponse<SearchPlaceResponse>>(path, {
    method: "GET",
  });

  if (data?.resultType === "SUCCESS" && data.success) {
    // API 응답을 UI에서 사용하는 Place 형식으로 변환
    return data.success.places.map((place) => ({
      id: place.id,
      name: place.placeName,
      address: place.addressName || place.roadAddressName,
      place_name: place.placeName,
      address_name: place.addressName,
      road_address_name: place.roadAddressName,
      category: place.categoryName,
      categoryName: place.categoryName,
      phone: place.phone,
      x: place.x,
      y: place.y,
      placeUrl: place.placeUrl,
      distance: place.distance,
    }));
  }

  // 에러 메시지 추출
  const errorMsg = data?.error?.errorMessage || data?.message || "장소 검색에 실패했습니다.";
  throw new Error(errorMsg);
}

