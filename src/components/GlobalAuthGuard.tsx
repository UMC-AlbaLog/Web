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

    // URL 정리 (쿼리만 제거, pathname은 그대로 유지 → /income 새로고침 시 유지)
    if (accessToken || refreshToken) {
      window.history.replaceState({}, document.title, location.pathname);
    }

    setIsReady(true);
  }, [location.pathname]);

  // 로딩 중에는 null 대신 짧은 로딩 UI로 깜빡임/잘못된 라우트 방지
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="text-slate-400 text-sm">로딩 중...</span>
      </div>
    );
  }

  const token = sessionStorage.getItem("accessToken");
  const publicPaths = ["/", "/login", "/signup", "/onboarding"];

  if (!token && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  // 로그인 페이지에 토큰이 있을 때만 /home으로 (OAuth 콜백 등). /income 등 다른 경로는 절대 건드리지 않음
  if (token && location.pathname === "/login") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default GlobalAuthGuard;
