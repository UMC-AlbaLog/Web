import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

export const placeService = {
  // 장소/가게 검색 API
  searchPlaces: async (query: string) => {
    if (!query.trim()) return [];

    const data = await apiRequest<TsoaResponse<any>>(
      `/api/places/search?query=${encodeURIComponent(query)}`, 
      { method: "GET" }
    );

    if (data?.resultType === "SUCCESS") {
      return data.success?.places || [];
    }
    
    return [];
  }
};