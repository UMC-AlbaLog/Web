import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

const Signup = () => {
  const navigate = useNavigate();

  const [user] = useState<GoogleUser | null>(() => {
    const data = sessionStorage.getItem("googleUser");
    return data ? JSON.parse(data) : null;
  });

  const [nickname, setNickname] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState<"M" | "F" | "">("");

  // 로그인 안 했으면 강제 로그인
  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const isValidBirth = (birth: string) => {
    const regex = /^\d{4}\.\d{2}\.\d{2}$/;
    if (!regex.test(birth)) return false;

    const [y, m, d] = birth.split(".").map(Number);
    const date = new Date(y, m - 1, d);

    return (
      date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d &&
      date <= new Date()
    );
  };

  const handleSubmit = () => {
    if (!nickname || !birth || !gender) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    if (!isValidBirth(birth)) {
      alert("생년월일 형식이 올바르지 않습니다. (YYYY.MM.DD)");
      return;
    }

    // 회원가입 정보 저장
    sessionStorage.setItem(
      "signupInfo",
      JSON.stringify({ nickname, birth, gender })
    );

    // 🔥 다음 단계: 온보딩
    navigate("/onboarding");
  };

  return (
    <div className="h-screen w-full bg-gray-300 flex items-center justify-center">
      <div className="w-[420px] bg-white rounded-xl shadow px-10 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">알바로그</h2>

        <div className="flex justify-center mb-8">
          <img
            src={user.picture}
            alt="profile"
            className="w-36 h-36 rounded-full bg-gray-300"
          />
        </div>

        <label className="block text-sm mb-1">아이디</label>
        <input
          value={user.email}
          disabled
          className="w-full mb-4 px-3 py-2 border rounded bg-gray-200 text-sm"
        />

        <label className="block text-sm mb-1">닉네임</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded text-sm"
        />

        <label className="block text-sm mb-1">생년월일</label>
        <input
          value={birth}
          onChange={(e) =>
            setBirth(e.target.value.replace(/[^0-9.]/g, ""))
          }
          placeholder="YYYY.MM.DD"
          className="w-full mb-4 px-3 py-2 border rounded text-sm"
        />

        <label className="block text-sm mb-2">성별</label>
        <div className="flex gap-6 mb-6 text-sm">
          <label>
            <input
              type="radio"
              checked={gender === "M"}
              onChange={() => setGender("M")}
            /> 남성
          </label>
          <label>
            <input
              type="radio"
              checked={gender === "F"}
              onChange={() => setGender("F")}
            /> 여성
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 border rounded font-semibold"
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Signup;
