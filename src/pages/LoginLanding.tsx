import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
}

const LoginLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-gray-300 flex items-center justify-center">
      <div className="w-[900px] h-[420px] bg-gray-200 flex items-center justify-center rounded-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">알바 관리를 한번에</h1>
          <h2 className="text-4xl font-extrabold mb-8">알바로그</h2>

          <GoogleLogin
            onSuccess={(res) => {
              if (!res.credential) return;

              const decoded = jwtDecode<GooglePayload>(res.credential);

              // 🔥 구글 로그인 정보 저장
              sessionStorage.setItem(
                "googleUser",
                JSON.stringify(decoded)
              );

              // 🔥 무조건 회원가입 폼으로
              navigate("/signup");
            }}
            onError={() => {
              console.log("구글 로그인 실패");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
