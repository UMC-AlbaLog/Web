import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://albalog.kro.kr
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ★ 중요 (CORS + 쿠키 필요하면)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    const cleanToken = token.replace(/^"|"$/g, "");
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

export default api;
