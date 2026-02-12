import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://albalog.kro.kr
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 요청마다 Authorization 자동 삽입
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
