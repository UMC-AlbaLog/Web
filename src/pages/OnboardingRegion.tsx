import { useNavigate } from "react-router-dom";
import { useState } from "react";

const OnboardingRegion = () => {
  const navigate = useNavigate();
  const [sido, setSido] = useState("");
  const [gugun, setGugun] = useState("");

  const canNext = !!(sido && gugun);

  const handleNext = () => {
    sessionStorage.setItem(
      "userRegion",
      JSON.stringify({ sido, gugun })
    );
    navigate("/home");
  };

  return (
    <div className="h-screen w-full bg-gray-300 flex items-center justify-center">
      <div className="w-[900px] h-[420px] bg-gray-200 rounded-md p-10 relative">
        <h1 className="text-3xl font-bold text-center mb-4">
          주로 알바하는 지역을 선택해주세요
        </h1>

        <div className="flex justify-center gap-6 mt-10">
          <select onChange={(e) => setSido(e.target.value)}>
            <option value="">시/도 선택</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
          </select>

          <select
            disabled={!sido}
            onChange={(e) => setGugun(e.target.value)}
          >
            <option value="">구/군 선택</option>
            {sido === "서울" && (
              <>
                <option value="강서구">강서구</option>
                <option value="강남구">강남구</option>
              </>
            )}
          </select>
        </div>

        <div className="absolute bottom-6 right-6">
          <button
            disabled={!canNext}
            onClick={handleNext}
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingRegion;
