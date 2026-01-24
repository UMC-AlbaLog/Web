import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const GlobalAuthGuard = ({ children }: Props) => {
  const location = useLocation();
  const user = sessionStorage.getItem("googleUser");

  // 로그인 안 됨 → 오직 "/" 만 허용
  if (!user) {
    return location.pathname === "/"
      ? children
      : <Navigate to="/" replace />;
  }

  // 로그인 돼 있으면 전부 허용 (세부 흐름은 각 페이지에서)
  return children;
};

export default GlobalAuthGuard;
