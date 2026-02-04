import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { loginWithGoogle, getTestAccessToken } from "../api/auth";
import { setAccessToken } from "../api/client";

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
}

const LoginLanding = () => {
  const navigate = useNavigate();
  const [testTokenMessage, setTestTokenMessage] = useState<string | null>(null);

  const handleTestTokenLogin = async () => {
    setTestTokenMessage(null);
    const token = await getTestAccessToken();
    if (token) {
      setAccessToken(token);
      // GlobalAuthGuard는 googleUser가 있어야 /home 등 접근 허용 → 테스트용 더미 저장
      sessionStorage.setItem(
        "googleUser",
        JSON.stringify({ email: "test@test.com", name: "테스트 유저", picture: "" })
      );
      setTestTokenMessage("테스트 토큰 저장됨 → 홈으로 이동합니다.");
      setTimeout(() => navigate("/home", { replace: true }), 800);
    } else {
      setTestTokenMessage("GET /api/test 호출 실패. 백엔드 연결·CORS를 확인하세요.");
    }
  };

  return (
    <div className="h-screen w-full bg-gray-300 flex items-center justify-center">
      <div className="w-[900px] h-[420px] bg-gray-200 flex items-center justify-center rounded-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">알바 관리를 한번에</h1>
          <h2 className="text-4xl font-extrabold mb-8">알바로그</h2>

          <GoogleLogin
            onSuccess={async (res) => {
              if (!res.credential) return;

              const decoded = jwtDecode<GooglePayload>(res.credential);
              sessionStorage.setItem("googleUser", JSON.stringify(decoded));

              // 백엔드에 Google ID 토큰 전달 → JWT(accessToken) 수신 → Authorization: Bearer 용으로 저장
              const auth = await loginWithGoogle(res.credential);
              if (auth?.accessToken) {
                setAccessToken(auth.accessToken);
              } else if (import.meta.env.DEV) {
                console.warn(
                  "[로그인] 백엔드에서 accessToken을 받지 못했습니다. Session Storage에 accessToken이 없으면 스케줄·오늘 근무 등 API는 호출되지 않고 로컬만 사용됩니다. POST /auth/google 응답을 { accessToken: 'JWT...' } 형태로 주세요."
                );
              }

              navigate("/signup");
            }}
            onError={() => {
              console.log("구글 로그인 실패");
            }}
          />

          <div className="mt-6 pt-6 border-t border-gray-400">
            <p className="text-sm text-gray-500 mb-2">개발/테스트용: GET /api/test 로 accessToken 발급</p>
            <button
              type="button"
              onClick={handleTestTokenLogin}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-md border border-gray-500"
            >
              테스트 토큰으로 로그인
            </button>
            {testTokenMessage && (
              <p className={`mt-2 text-sm ${testTokenMessage.startsWith("테스트 토큰") ? "text-green-600" : "text-red-600"}`}>
                {testTokenMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
