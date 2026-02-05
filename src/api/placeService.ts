import api from './client';

export const placeService = {
  searchPlaces: async (query: string) => {
    if (!query.trim()) return [];

    const res = await api.get('/api/places/search', {
      params: { query }
    });

    return res.data.success?.places || [];
  }
};