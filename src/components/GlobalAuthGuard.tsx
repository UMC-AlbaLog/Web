// components/GlobalAuthGuard.tsx
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const GlobalAuthGuard = ({ children }: Props) => {
  const location = useLocation();
  const token = sessionStorage.getItem("accessToken");

  // 🔥 로그인 없이 접근 허용 경로
  const publicPaths = ["/", "/login", "/signup", "/onboarding"];

  if (!token && !publicPaths.includes(location.pathname)) {
    console.log("로그인 안 되어 있음 → /login 이동");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default GlobalAuthGuard;
