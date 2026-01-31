import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const REGION_DATA: Record<string, string[]> = {
  서울: ["강남구", "강동구", "강서구", "관악구", "노원구"],
  경기: ["수원시", "성남시", "부천시", "고양시"],
};

type FlatRegion = {
  sido: string;
  gugun: string;
};

const OnboardingRegion = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedGugun, setSelectedGugun] = useState<string | null>(null);

  const canNext = !!(selectedSido && selectedGugun);

  /** 🔹 전체 지역 flat */
  const flatRegions: FlatRegion[] = Object.entries(REGION_DATA).flatMap(
    ([sido, guguns]) =>
      guguns.map((gugun) => ({ sido, gugun }))
  );

  /** 🔹 검색 */
  const searchResults = search
    ? flatRegions.filter(
        (r) =>
          r.sido.includes(search) || r.gugun.includes(search)
      )
    : [];

  /** 🔹 외부 클릭 → 상태 초기화 (두 번째 이미지 상태) */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setSearch("");
        setSelectedSido(null);
        setSelectedGugun(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    sessionStorage.setItem(
      "userRegion",
      JSON.stringify({
        sido: selectedSido,
        gugun: selectedGugun,
      })
    );
    navigate("/home");
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="h-screen w-full bg-gray-300 flex items-center justify-center">
      <div
        ref={wrapperRef}
        className="w-[900px] h-[420px] bg-gray-200 rounded-md p-10 relative"
      >
        {/* 나중에 설정하기 */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 text-sm text-gray-600 hover:underline"
        >
          나중에 설정하기
        </button>

        <h1 className="text-3xl font-bold text-center mb-2">
          주로 알바하는 지역을 선택해주세요
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          여러 지역에서 일한다면, 가장 자주 가는 지역을 선택해주세요
        </p>

        {/* 검색 */}
        <div className="flex justify-center mb-6 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="지역명 검색 (예: 서울, 강서)"
            className="w-[320px] px-4 py-2 border rounded text-sm"
          />

          {search && (
            <div className="absolute top-11 w-[320px] bg-white border rounded shadow z-10 max-h-40 overflow-auto">
              {searchResults.map((r) => (
                <div
                  key={`${r.sido}-${r.gugun}`}
                  onClick={() => {
                    setSelectedSido(r.sido);
                    setSelectedGugun(r.gugun);
                    setSearch("");
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                >
                  {r.sido} {r.gugun}
                </div>
              ))}

              {searchResults.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* 카드 */}
        <div className="flex justify-center gap-10">
          {/* 시/도 */}
          <div className="w-[220px] min-h-[180px] bg-white rounded p-4">
            <h3 className="font-semibold mb-3">시/도 선택</h3>
            <ul className="space-y-2">
              {Object.keys(REGION_DATA).map((sido) => (
                <li
                  key={sido}
                  onClick={() => {
                    setSelectedSido(sido);
                    setSelectedGugun(null);
                  }}
                  className={`cursor-pointer px-3 py-2 rounded
                    ${
                      selectedSido === sido
                        ? "bg-blue-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                >
                  {sido}
                </li>
              ))}
            </ul>
          </div>

          {/* 구/군 */}
          <div className="w-[220px] min-h-[180px] bg-white rounded p-4">
            <h3 className="font-semibold mb-3">구/군 선택</h3>

            {!selectedSido && (
              <p className="text-sm text-gray-400">
                시/도를 먼저 선택해주세요
              </p>
            )}

            {selectedSido && (
              <ul className="space-y-2">
                {REGION_DATA[selectedSido].map((gugun) => (
                  <li
                    key={gugun}
                    onClick={() => setSelectedGugun(gugun)}
                    className={`cursor-pointer px-3 py-2 rounded
                      ${
                        selectedGugun === gugun
                          ? "bg-blue-100 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                  >
                    {gugun}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 다음 */}
        <div className="absolute bottom-6 right-6">
          <button
            disabled={!canNext}
            onClick={handleNext}
            className={`px-6 py-3 rounded font-semibold
              ${
                canNext
                  ? "bg-gray-400 hover:bg-gray-500 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingRegion;
