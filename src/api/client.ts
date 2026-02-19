import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/* ============================= */ 
/* axios 인스턴스 생성 */
/* ============================= */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

/* ============================= */
/* 토큰 관리 */
/* ============================= */
function getAccessToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem("accessToken", token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem("accessToken");
}

/* ============================= */
/* 요청 인터셉터 (자동 토큰 삽입) */
/* ============================= */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ============================= */
/* 공통 요청 옵션 타입 */
/* ============================= */
export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

/* ============================= */
/* 공통 API 요청 함수 */
/* ============================= */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = options.method ?? "GET";

  const config: AxiosRequestConfig = {
    method,
    url: path,
    headers: {
      ...options.headers,
    },
  };

  if (options.body != null && method !== "GET") {
    config.data = options.body;
  }

  if (import.meta.env.DEV) {
    console.log("[API] 요청:", method, path);
  }

  try {
    const res = await api.request<T>(config);

    if (import.meta.env.DEV) {
      console.log("[API] 응답:", res.status, path);
    }

    return res.data;
  } catch (err: unknown) {
    if (!axios.isAxiosError(err) || !err.response) {
      const msg = err instanceof Error ? err.message : "Network Error";
      throw new Error(msg);
    }

    const { response } = err;
    const status = response.status;
    const data = response.data;

    let errMessage: string;

    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      const error = obj.error as Record<string, unknown> | undefined;

      errMessage =
        (error?.errorMessage as string) ??
        (obj.message as string) ??
        (obj.error as string) ??
        `HTTP ${status}`;
    } else {
      errMessage = typeof data === "string" ? data : `HTTP ${status}`;
    }

    if (import.meta.env.DEV) {
      console.warn("[API] 에러 응답:", status, path, data);
    }

    throw new Error(errMessage);
  }
}

export default api;
