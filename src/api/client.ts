import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getAccessToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem("accessToken", token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem("accessToken");
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

function buildUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path);
  const token = getAccessToken();
  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
  };
  if (options.body != null && method !== "GET") {
    config.data = options.body;
  }

  if (import.meta.env.DEV) {
    console.log("[API] 요청:", method, url);
  }

  try {
    const res = await axios.request<T>(config);
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
        String(data);
    } else {
      errMessage = typeof data === "string" ? data : `HTTP ${status}`;
    }
    if (import.meta.env.DEV) {
      console.warn("[API] 에러 응답:", status, path, data);
    }
    throw new Error(String(errMessage || `HTTP ${status}`));
  }
}
