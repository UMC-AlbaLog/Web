import api from './client';

export const albaService = {
  getAlbaList: async (params?: { startTime?: string; endTime?: string }) => {
    const res = await api.get('/api/alba/search', { params });
    return res.data.success || res.data || [];
  }
};