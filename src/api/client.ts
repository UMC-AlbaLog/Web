import axios from 'axios';

const api = axios.create({
  baseURL: 'http://albalog.kro.kr',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    const cleanToken = token.replace(/^"|"$/g, ''); 
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

export default api;