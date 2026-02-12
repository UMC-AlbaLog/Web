import { useEffect, useState, type SetStateAction } from "react";
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

  const [nicknameError, setNicknameError] = useState("");
  const [birthError, setBirthError] = useState("");

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!nickname) {
      setNicknameError("닉네임을 설정해주세요.");
    } else if (nickname.length < 2 || nickname.length > 10) {
      setNicknameError("닉네임은 2글자 이상, 10자 이하로 설정해주세요.");
    } else {
      setNicknameError("");
    }
  }, [nickname]);

  useEffect(() => {
    if (!birth) {
      setBirthError("");
      return;
    }
    setBirthError("");
  }, [birth]);

  if (!user) return null;

  const isFormValid =
    nicknameError === "" &&
    birth !== null &&
    gender !== "";

  const handleSubmit = () => {
    if (!isFormValid) return;

    sessionStorage.setItem(
      "signupInfo",
      JSON.stringify({
        nickname,
        birth: birth?.toISOString().slice(0, 10),
        gender,
      })
    );

    navigate("/onboarding");
  };

  return (
    /* 🔥 전체 배경 그라데이션 */
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100">
      
      {/* 🔥 흰색 카드 */}
      <div className="w-[520px] bg-white rounded-3xl shadow-xl px-12 py-12">

        {/* 프로필 */}
        <div className="flex justify-center mb-10">
          <img
            src={user.picture}
            alt="profile"
            className="w-32 h-32 rounded-full bg-gray-200"
          />
        </div>

        {/* 아이디 */}
        <label className="block text-sm mb-1">아이디</label>
        <input
          value={user.email}
          disabled
          className="w-full h-12 px-4 mb-5 rounded-xl border bg-white"
        />

        {/* 닉네임 */}
        <label className="block text-sm mb-1">닉네임</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className={`w-full h-12 px-4 rounded-xl border bg-white ${
            nicknameError ? "border-red-400" : "border-gray-300"
          }`}
        />
        {nicknameError && (
          <p className="text-red-500 text-xs mt-1">{nicknameError}</p>
        )}

        {/* 생년월일 */}
        <label className="block text-sm mt-6 mb-1">생년월일</label>
        <DatePicker
          selected={birth}
          onChange={(date: SetStateAction<Date | null>) => setBirth(date)}
          dateFormat="yyyy.MM.dd"
          placeholderText="YYYY.MM.DD"
          maxDate={new Date()}
          className="w-full h-12 px-4 rounded-xl border bg-white"
        />

        {/* 성별 */}
        <label className="block text-sm mt-6 mb-2">성별</label>
        <div className="flex gap-8 mb-10">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={gender === "M"}
              onChange={() => setGender("M")}
            />
            남성
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={gender === "F"}
              onChange={() => setGender("F")}
            />
            여성
          </label>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full h-14 rounded-xl text-lg font-semibold transition
            ${
              isFormValid
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          회원가입 →
        </button>
      </div>
    </div>
  );
};

export default Signup;
