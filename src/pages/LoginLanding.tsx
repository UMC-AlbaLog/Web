import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getTestAccessToken } from "../api/auth";
import { setAccessToken } from "../api/client";

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
}

const LoginLanding = () => {
  const navigate = useNavigate();
  const [testLoading, setTestLoading] = useState(false);

  const handleTestLogin = async () => {
    setTestLoading(true);
    try {
      const token = await getTestAccessToken();
      if (token) {
        setAccessToken(token);
        sessionStorage.setItem(
          "googleUser",
          JSON.stringify({ email: "test@test.com", name: "테스트 유저", picture: "" })
        );
        navigate("/home");
      } else {
        alert("테스트 토큰을 받지 못했습니다. 백엔드 /api/test 가 동작하는지 확인해주세요.");
      }
    } catch (e) {
      alert("테스트 로그인 실패: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50">
      {/* 카드 */}
      <div className="w-[520px] rounded-2xl bg-white/70 backdrop-blur shadow-xl px-12 py-14 text-center">
        {/* 타이틀 */}
        <h1 className="text-sm font-medium text-gray-500 mb-2">
          알바 관리를 한번에
        </h1>
        <h2 className="text-3xl font-extrabold mb-10">
          알바로그
        </h2>

        {/* 설명 */}
        <p className="text-gray-600 mb-10">
          구글 계정으로 간편하게 로그인하고<br />
          스마트한 알바 생활을 시작해보세요.
        </p>

        {/* 구글 로그인 */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(res) => {
              if (!res.credential) return;

              const decoded = jwtDecode<GooglePayload>(res.credential);

              // 구글 유저 정보 저장
              sessionStorage.setItem(
                "googleUser",
                JSON.stringify(decoded)
              );

              // 회원가입으로 이동
              navigate("/signup");
            }}
            onError={() => {
              alert("구글 로그인에 실패했습니다.");
            }}
          />
        </div>

        {/* 테스트 API 로그인 (개발/테스트용) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleTestLogin}
            disabled={testLoading}
            className="text-sm text-gray-500 hover:text-indigo-600 underline disabled:opacity-50"
          >
            {testLoading ? "토큰 요청 중..." : "테스트 API로 로그인"}
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="text-xs text-gray-400 mt-10">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
};

export default LoginLanding;
