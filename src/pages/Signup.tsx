import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api/client";

const Signup = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [birth, setBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "">("");

  const [nicknameError, setNicknameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  /* =========================
   * URL에서 토큰 저장
   * ========================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      sessionStorage.setItem("refreshToken", refreshToken);
    }

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* =========================
   * 🔥 프로필 이미지 호출
   * ========================= */
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const res = await api.get("/api/user/profile");

        if (res.data.resultType === "SUCCESS") {
          setProfileImage(res.data.success);
        }
      } catch (error) {
        console.error("프로필 이미지 불러오기 실패:", error);
      }
    };

    fetchProfileImage();
  }, []);

  /* =========================
   * 닉네임 검증
   * ========================= */
  useEffect(() => {
    if (!nickname) {
      setNicknameError("닉네임을 설정해주세요.");
    } else if (nickname.length < 2 || nickname.length > 10) {
      setNicknameError("닉네임은 2~10자 사이로 설정해주세요.");
    } else {
      setNicknameError("");
    }
  }, [nickname]);

  const isFormValid =
    nicknameError === "" &&
    birth !== null &&
    gender !== "";

  /* =========================
   * 회원가입 요청
   * ========================= */
  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);

      await api.post("/api/user/auth/register", {
        email: "",
        nickname: nickname,
        birthdate: birth?.toISOString(),
        gender: gender,
      });

      navigate("/onboarding", { replace: true });

    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100">
      <div className="w-[520px] bg-white rounded-3xl shadow-xl px-12 py-12">

        <h2 className="text-2xl font-bold text-center mb-8">
          회원가입 정보 입력
        </h2>

        {/* 🔥 프로필 이미지 */}
        <div className="flex justify-center mb-8">
          <img
            src={profileImage ?? "/default-profile.png"}
            alt="profile"
            className="w-28 h-28 rounded-full bg-gray-200 object-cover"
          />
        </div>

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
          onChange={(date) => setBirth(date)}
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
              checked={gender === "male"}
              onChange={() => setGender("male")}
            />
            남성
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={gender === "female"}
              onChange={() => setGender("female")}
            />
            여성
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className={`w-full h-14 rounded-xl text-lg font-semibold transition
            ${
              isFormValid
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {loading ? "처리 중..." : "회원가입 →"}
        </button>
      </div>
    </div>
  );
};

export default Signup;
