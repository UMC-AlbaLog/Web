import api from './client';
import type { TsoaResponse } from './types';

export const userService = {
  getUserInfo: async () => {
    const res = await api.get<TsoaResponse<any>>('/api/user/info');
    return res.data.resultType === "SUCCESS" ? res.data.success : null;
  },

  getUserProfile: async (userId: string) => {
    const res = await api.get<TsoaResponse<any>>(`/api/profile/${userId}`);
    return res.data.resultType === "SUCCESS" ? res.data.success : null;
  }
};