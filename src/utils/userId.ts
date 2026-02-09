import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;
  email?: string;
  [key: string]: any;
}

/**
 * JWT 토큰에서 userId 추출
 */
export function getUserIdFromToken(): string | null {
  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.id || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}


