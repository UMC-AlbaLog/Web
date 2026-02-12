// components/GlobalAuthGuard.tsx
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface Props {
  children: JSX.Element;
}

const GlobalAuthGuard = ({ children }: Props) => {
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      sessionStorage.setItem("refreshToken", refreshToken);
    }

    // URL 정리
    if (accessToken || refreshToken) {
      window.history.replaceState({}, document.title, location.pathname);
    }

    setIsReady(true);
  }, [location.pathname]);

  if (!isReady) return null; // 🔥 토큰 세팅 끝날 때까지 대기

  const token = sessionStorage.getItem("accessToken");
  const publicPaths = ["/", "/login"];

  if (!token && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  if (token && location.pathname === "/login") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default GlobalAuthGuard;
