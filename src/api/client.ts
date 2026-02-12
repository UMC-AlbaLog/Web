import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    const cleanToken = token.replace(/^"|"$/g, ''); 
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

export default api;