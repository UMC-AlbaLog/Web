import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [birth, setBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<"M" | "F" | "">("");

  // 로그인 안 했으면 강제 이동
  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSubmit = () => {
    if (!nickname || !birth || !gender) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const formattedBirth = birth
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ".");

    sessionStorage.setItem(
      "signupInfo",
      JSON.stringify({
        nickname,
        birth: formattedBirth,
        gender,
      })
    );

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
        <DatePicker
          selected={birth}
          onChange={(date: Date | null) => setBirth(date)}
          dateFormat="yyyy.MM.dd"
          maxDate={new Date()}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          placeholderText="생년월일 선택"
          className="w-full mb-4 px-3 py-2 border rounded text-sm"
        />

        <label className="block text-sm mb-2">성별</label>
        <div className="flex gap-6 mb-6 text-sm">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={gender === "M"}
              onChange={() => setGender("M")}
            />
            남성
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={gender === "F"}
              onChange={() => setGender("F")}
            />
            여성
          </label>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-3 border rounded font-semibold hover:bg-gray-100"
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Signup;
