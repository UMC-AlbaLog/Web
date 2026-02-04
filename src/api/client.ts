const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL ?? "";

export function getAccessToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem("accessToken", token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem("accessToken");
}

export class ApiAuthError extends Error {
  constructor(message = "인증이 필요합니다.") {
    super(message);
    this.name = "ApiAuthError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
    public errorMessage?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestInitWithBody = Omit<RequestInit, "body"> & { body?: object };

const REFRESH_PATH = "/api/user/auth/refresh";

async function parseResponse<T>(res: Response, path: string): Promise<T> {
  if (res.status === 204) {
    if (import.meta.env.DEV) console.log("[API] 응답:", 204, path, "→ No content");
    return undefined as T;
  }

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const errMsg =
      isJson && typeof data === "object" && data?.error?.errorMessage
        ? data.error.errorMessage
        : data?.message ?? res.statusText ?? "요청에 실패했습니다.";
    throw new ApiError(
      errMsg,
      res.status,
      data?.error?.errorCode,
      data?.error?.errorMessage
    );
  }

  if (import.meta.env.DEV) {
    const summary =
      typeof data === "object" && data !== null
        ? Array.isArray(data)
          ? `배열 ${(data as unknown[]).length}건`
          : "items" in data && Array.isArray((data as { items: unknown[] }).items)
            ? `items ${(data as { items: unknown[] }).items.length}건`
            : "객체"
        : "텍스트";
    console.log("[API] 응답:", res.status, path, "→", summary, data);
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInitWithBody = {},
  isRetry = false
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : options.body,
  };

  if (import.meta.env.DEV) {
    console.log("[API] 요청:", options.method ?? "GET", url);
  }

  const res = await fetch(url, init);

  if (res.status === 401) {
    if (!isRetry && path !== REFRESH_PATH) {
      const { refreshAccessToken } = await import("./user");
      const newToken = await refreshAccessToken();
      if (newToken) {
        setAccessToken(newToken);
        if (import.meta.env.DEV) console.log("[API] 토큰 재발급 후 재시도:", options.method ?? "GET", path);
        return apiRequest<T>(path, options, true);
      }
    }
    clearAccessToken();
    throw new ApiAuthError();
  }

  return parseResponse<T>(res, path);
}
