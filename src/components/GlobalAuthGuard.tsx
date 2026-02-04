// components/GlobalAuthGuard.tsx
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const GlobalAuthGuard = ({ children }: Props) => {
  const location = useLocation();
  const user = sessionStorage.getItem("googleUser");

  // 로그인 전 허용 경로
  const publicPaths = ["/", "/login", "/signup", "/onboarding"];

  if (!user && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GlobalAuthGuard;
