import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://albalog.kro.kr";

const LoginLanding = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // 🔥 로그인 후 accessToken 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");

    if (token) {
      // sessionStorage 저장
      sessionStorage.setItem("accessToken", token);

      // URL에서 토큰 제거 (보안상 깔끔하게)
      window.history.replaceState({}, document.title, "/");

      // 홈으로 이동
      navigate("/home");
    }
  }, [navigate]);

  // 🔥 구글 로그인 이동
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/user/auth/google`;
  };

  // 🔥 refresh 테스트
  const handleRefresh = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/auth/refresh`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage("❌ Refresh 실패");
        console.error(data);
        return;
      }

      setMessage("✅ Refresh 성공");
      console.log("refresh 성공:", data);
    } catch (error) {
      setMessage("❌ 네트워크 오류");
      console.error(error);
    }
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

        {/* 🔥 구글 로그인 버튼 */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleGoogleLogin}
            className="px-6 py-3 bg-white border rounded-lg shadow hover:bg-gray-50 transition"
          >
            Google로 로그인
          </button>
        </div>

        {/* 🔥 refresh 테스트 버튼 */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Refresh 테스트
          </button>
        </div>

        {message && (
          <p className="text-sm mt-4 font-medium">
            {message}
          </p>
        )}

        <p className="text-xs text-gray-400 mt-10">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>

      </div>
    </div>
  );
};

export default LoginLanding;
