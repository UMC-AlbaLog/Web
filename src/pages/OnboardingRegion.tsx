import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { searchRegion, saveUserRegion } from "../api/region";

const REGION_DATA: Record<string, string[]> = {
  서울특별시: [
    "강남구","강동구","강북구","강서구","관악구","광진구","구로구",
    "금천구","노원구","도봉구","동대문구","동작구","마포구",
    "서대문구","서초구","성동구","성북구","송파구","양천구",
    "영등포구","용산구","은평구","종로구","중구","중랑구"
  ],
  경기도: [
    "수원시","성남시","고양시","용인시","부천시","안산시","안양시"
  ],
  인천광역시: [
    "미추홀구","연수구","부평구","계양구","남동구"
  ],
  제주특별자치도: ["제주시","서귀포시"]
};

const OnboardingRegion = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedGugun, setSelectedGugun] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canNext = !!(selectedSido && selectedGugun);

  /* =========================
   * 검색 flatten
   * ========================= */
  const flatRegions = Object.entries(REGION_DATA).flatMap(
    ([sido, guguns]) => guguns.map((gugun) => ({ sido, gugun }))
  );

  const searchResults = search
    ? flatRegions.filter(
        (r) => r.sido.includes(search) || r.gugun.includes(search)
      )
    : [];

  /* =========================
   * 외부 클릭 시 검색창 닫기
   * ========================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
   * 건너뛰기
   * ========================= */
  const handleSkip = () => {
    navigate("/home", { replace: true });
  };

  /* =========================
   * 다음 버튼 ( region 조회 → DB 저장)
   * ========================= */
  const handleNext = async () => {
    if (!canNext) return;

    try {
      setLoading(true);

      const query = `${selectedSido} ${selectedGugun}`;

      // 1️ region_id 조회
      const results = await searchRegion(query);

      if (!results || results.length === 0) {
        alert("해당 지역을 찾을 수 없습니다.");
        return;
      }

      const regionId = results[0].region_id;

      // 2️ DB 저장
      await saveUserRegion(regionId);

      // 3️ 저장 성공 후 홈 이동
      navigate("/home", { replace: true });

    } catch (err) {
      console.error("지역 저장 실패:", err);
      alert("지역 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center relative">

      {/* 나중에 선택 */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-10 text-sm text-gray-500 hover:text-indigo-600 transition"
      >
        나중에 선택 →
      </button>

      <div
        ref={wrapperRef}
        className="w-full max-w-[900px] px-6 pt-16 pb-32"
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          주로 알바하는 지역을 선택해주세요
        </h1>

        <p className="text-center text-gray-500 mb-10">
          여러 지역에서 일한다면 가장 자주 가는 지역을 선택해주세요
        </p>

        {/* 🔎 검색 */}
        <div className="relative flex justify-center mb-10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="지역명 검색 (예: 서울특별시, 강남구)"
            className="w-full max-w-[420px] h-12 px-5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {search && (
            <div className="absolute top-14 w-full max-w-[420px] bg-white border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
              {searchResults.length > 0 ? (
                searchResults.map((r) => (
                  <div
                    key={`${r.sido}-${r.gugun}`}
                    onClick={() => {
                      setSelectedSido(r.sido);
                      setSelectedGugun(r.gugun);
                      setSearch("");
                    }}
                    className="px-5 py-3 text-sm cursor-pointer hover:bg-gray-100"
                  >
                    {r.sido} {r.gugun}
                  </div>
                ))
              ) : (
                <div className="px-5 py-3 text-sm text-gray-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* 시/도 & 구/군 선택 */}
        <div className="flex justify-center gap-8">
          {/* 시/도 */}
          <div className="w-[260px] bg-white border rounded-2xl shadow-sm p-5 max-h-[400px] overflow-y-auto">
            <h3 className="font-semibold mb-4">시/도 선택</h3>
            <ul className="space-y-2">
              {Object.keys(REGION_DATA).map((sido) => (
                <li
                  key={sido}
                  onClick={() => {
                    setSelectedSido(sido);
                    setSelectedGugun(null);
                  }}
                  className={`px-4 py-2 rounded-lg cursor-pointer
                    ${
                      selectedSido === sido
                        ? "bg-indigo-100 text-indigo-700 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                >
                  {sido}
                </li>
              ))}
            </ul>
          </div>

          {/* 구/군 */}
          <div className="w-[260px] bg-white border rounded-2xl shadow-sm p-5 max-h-[400px] overflow-y-auto">
            <h3 className="font-semibold mb-4">구/군 선택</h3>

            {!selectedSido ? (
              <p className="text-sm text-gray-400">
                시/도를 먼저 선택해주세요
              </p>
            ) : (
              <ul className="space-y-2">
                {REGION_DATA[selectedSido].map((gugun) => (
                  <li
                    key={gugun}
                    onClick={() => setSelectedGugun(gugun)}
                    className={`px-4 py-2 rounded-lg cursor-pointer
                      ${
                        selectedGugun === gugun
                          ? "bg-indigo-100 text-indigo-700 font-semibold"
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

        {/* 다음 버튼 */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
          <button
            onClick={handleNext}
            disabled={!canNext || loading}
            className={`px-12 h-14 rounded-2xl text-lg font-semibold transition
              ${
                canNext
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {loading ? "저장 중..." : "다음으로 →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingRegion;
