import api from './client';
import type { TsoaResponse } from './types';

export const placeService = {
  searchPlaces: async (query: string) => {
    if (!query.trim()) return [];

    const res = await api.get<TsoaResponse<any>>('/api/places/search', {
      params: { query }
    });

    return res.data.resultType === "SUCCESS" ? (res.data.success?.places || []) : [];
  }
};