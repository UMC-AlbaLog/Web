import type { TsoaResponse } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://albalog.kro.kr";

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  // 토큰 가져오기
  const token = sessionStorage.getItem("accessToken");
  
  // 기본 헤더 설정
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 요청 옵션
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // body가 있으면 JSON으로 변환
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  // 요청 실행
  const url = `${BASE_URL}${path}`;
  console.log("API Request:", {
    url,
    method,
    headers: requestHeaders,
    hasToken: !!token,
  });
  
  const response = await fetch(url, requestOptions);
  
  console.log("API Response:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: response.url,
  });

  // 4xx, 5xx 에러 처리
  if (!response.ok) {
    let errorMessage = "요청에 실패했습니다.";
    try {
      const errorData = await response.json();
      console.error("API Error Response (Full):", JSON.stringify(errorData, null, 2));
      console.error("API Error Response (Object):", errorData);
      
      // 다양한 에러 응답 형식 처리
      if (errorData.error?.errorMessage) {
        errorMessage = errorData.error.errorMessage;
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errorMessage) {
        errorMessage = errorData.errorMessage;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        // validation errors
        errorMessage = errorData.errors.map((e: any) => e.message || e).join(", ");
      } else if (errorData.error) {
        errorMessage = JSON.stringify(errorData.error);
      } else {
        // 전체 객체를 문자열로 변환
        errorMessage = `요청에 실패했습니다. (${response.status} ${response.statusText})`;
        if (Object.keys(errorData).length > 0) {
          errorMessage += `: ${JSON.stringify(errorData)}`;
        }
      }
    } catch (e) {
      // JSON 파싱 실패 시 기본 메시지 사용
      console.error("Failed to parse error response:", e);
      const text = await response.text().catch(() => "");
      errorMessage = `요청에 실패했습니다. (상태 코드: ${response.status} ${response.statusText})`;
      if (text) {
        errorMessage += ` - ${text.substring(0, 200)}`;
      }
    }
    throw new Error(errorMessage);
  }

  // 204 No Content 응답 처리
  if (response.status === 204) {
    return {} as T;
  }

  // JSON 응답 파싱
  return response.json();
}

