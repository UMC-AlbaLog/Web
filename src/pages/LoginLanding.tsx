import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const API_BASE_URL = "http://albalog.kro.kr";

const LoginLanding = () => {
  const navigate = useNavigate();

  /* =========================
   *  로그인 후 accessToken 처리
   * ========================= */
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");

  if (!accessToken) return;

  sessionStorage.setItem("accessToken", accessToken);

  if (refreshToken) {
    sessionStorage.setItem("refreshToken", refreshToken);
  }

  // URL 정리
  window.history.replaceState({}, document.title, "/login");

 
  window.location.href = "/home";

}, []);


  /* =========================
   *  구글 로그인 이동
   * ========================= */
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/user/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50">
      <div className="w-[520px] rounded-2xl bg-white/70 backdrop-blur shadow-xl px-12 py-14 text-center">

        <h1 className="text-sm font-medium text-gray-500 mb-2">
          알바 관리를 한번에
        </h1>

        <h2 className="text-3xl font-extrabold mb-10">
          알바로그
        </h2>

        <p className="text-gray-600 mb-8">
          구글 계정으로 간편하게 로그인하고<br />
          스마트한 알바 생활을 시작해보세요.
        </p>

        {/*  구글 로그인 버튼 */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleGoogleLogin}
            className="px-6 py-3 bg-white border rounded-lg shadow hover:bg-gray-50 transition"
          >
            Google로 로그인
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-10">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>

      </div>
    </div>
  );
};

export default LoginLanding;
