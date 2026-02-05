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

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };
  if (options.body != null && options.method !== "GET") {
    init.body = JSON.stringify(options.body);
  }

  if (import.meta.env.DEV) {
    console.log("[API] 요청:", init.method, url);
  }

  const res = await fetch(url, init);

  if (import.meta.env.DEV) {
    console.log("[API] 응답:", res.status, path);
  }

  if (!res.ok) {
    const text = await res.text();
    let errMessage = text;
    try {
      const json = JSON.parse(text);
      const err = json.error;
      errMessage = err?.errorMessage ?? json.message ?? json.error ?? text;
      if (import.meta.env.DEV && (err?.errorMessage ?? json.message ?? json.error)) {
        console.warn("[API] 에러 응답:", res.status, path, json);
      }
    } catch {
      if (import.meta.env.DEV) console.warn("[API] 에러 본문:", text);
    }
    throw new Error(String(errMessage) || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return undefined as unknown as T;
}
