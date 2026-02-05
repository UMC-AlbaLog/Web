import api from './client';

export const userService = {
  getUserInfo: async () => {
    const res = await api.get('/api/user/info');
    return typeof res.data === 'object' ? res.data.success || res.data.userId : res.data;
  },

  getUserProfile: async (userId: string) => {
    const res = await api.get(`/api/profile/${userId}`);
    return res.data.success || res.data;
  }
};