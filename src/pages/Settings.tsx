import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type TabType = "notification" | "settlement" | "workEnvironment";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("settlement");
  const [isEditingSettlement, setIsEditingSettlement] = useState(false);
  const [settlementData, setSettlementData] = useState({
    bankName: "신한",
    accountNumber: "110-000-0000000",
    accountHolder: "홍길동",
  });

  // 저장된 알림 설정 불러오기
  const loadNotificationSettings = () => {
    const saved = sessionStorage.getItem("notificationSettings");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      all: true,
      workRelated: true,
      clockInOut: true,
      preWorkStart: true,
      substituteRecommendation: true,
      newCustomJob: true,
      settlementStatus: true,
    };
  };

  const [notifications, setNotifications] = useState(loadNotificationSettings());

  const [workEnvironment, setWorkEnvironment] = useState({
    searchQuery: "",
    selectedAreas: ["강남구", "용산구"],
    weekStartDay: "월",
    use24Hour: false,
  });

  // 검색 가능한 지역 목록 (전체 주소)
  const availableAreas = [
    "서울시 마포구",
    "서울시 강남구",
    "서울시 용산구",
    "서울시 서초구",
    "서울시 송파구",
  ];

  // 전체 주소에서 구만 추출하는 함수
  const extractGu = (fullAddress: string) => {
    return fullAddress.replace("서울시 ", "");
  };

  // 검색 결과 필터링
  const searchResults = workEnvironment.searchQuery
    ? availableAreas.filter((area) =>
        area.includes(workEnvironment.searchQuery)
      )
    : [];

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };
      // sessionStorage에 저장
      sessionStorage.setItem("notificationSettings", JSON.stringify(updated));
      return updated;
    });
  };

  // 사용자가 클릭 후 직접 입력으로 수정, 수정 버튼 클릭 시 저장
  const handleSettlementEdit = () => {
    if (isEditingSettlement) {
      // 저장 로직
      console.log("Saving settlement data:", settlementData);
      // 실제로는 서버에 저장
    }
    setIsEditingSettlement(!isEditingSettlement);
  };

  return (
    <main className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto">
      <div className="mb-8">
        <p className="text-3xl font-black text-gray-800">Settings</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("notification")}
          className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === "notification"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          알림 설정
        </button>
        <button
          onClick={() => setActiveTab("settlement")}
          className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === "settlement"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          정산 정보
        </button>
        <button
          onClick={() => setActiveTab("workEnvironment")}
          className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === "workEnvironment"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          근무 환경
        </button>
      </div>

      {/* 알림 설정 탭 */}
      {activeTab === "notification" && (
        <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
          <h3 className="text-xl font-black text-gray-800 mb-6">알림 설정</h3>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => {
              const labels: Record<string, { title: string; desc?: string }> = {
                all: { title: "전체 알림" },
                workRelated: { title: "근무 관련 알림" },
                clockInOut: { title: "출근/퇴근 시간 알림" },
                preWorkStart: { title: "근무 시작 전 알림" },
                substituteRecommendation: { title: "대타 추천 관련 알림" },
                newCustomJob: { title: "신규 맞춤 대타 공고 알림" },
                settlementStatus: { title: "정산 완료/대기 상태 변경 알림" },
              };

              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 border-b border-gray-200"
                >
                  <span className="text-sm font-black text-gray-800">
                    {labels[key]?.title || key}
                  </span>
                  <button
                    onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? "bg-gray-800" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        value ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 정산 정보 탭 */}
      {activeTab === "settlement" && (
        <div className="space-y-6">
          {/* 계좌 정보 */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-bold text-gray-800">은행명</label>
                <input
                  type="text"
                  value={settlementData.bankName}
                  onChange={(e) =>
                    setSettlementData({ ...settlementData, bankName: e.target.value })
                  }
                  disabled={!isEditingSettlement}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSettlementEdit}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg font-black text-sm hover:bg-gray-700 transition-all"
                >
                  {isEditingSettlement ? "저장" : "수정"}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-bold text-gray-800">계좌번호</label>
                <input
                  type="text"
                  value={settlementData.accountNumber}
                  onChange={(e) =>
                    setSettlementData({ ...settlementData, accountNumber: e.target.value })
                  }
                  disabled={!isEditingSettlement}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-bold text-gray-800">예금주</label>
                <input
                  type="text"
                  value={settlementData.accountHolder}
                  onChange={(e) =>
                    setSettlementData({ ...settlementData, accountHolder: e.target.value })
                  }
                  disabled={!isEditingSettlement}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              *계좌 번호는 본인 명의의 계좌만 가능합니다
            </p>
          </div>

          {/* 정산 내역 확인 */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
            <h3 className="text-xl font-black text-gray-800 mb-2">정산 내역 확인</h3>
            <p className="text-sm text-gray-600 mb-4">
              이전 정산 내역의 검색을 빠르게 확인할 수 있습니다.
            </p>
            <button
              onClick={() => navigate("/income")}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all"
            >
              [정산 내역 바로가기]
            </button>
          </div>

          {/* 정산 주기 및 방식 안내 */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
            <h3 className="text-xl font-black text-gray-800 mb-4">정산 주기 및 방식 안내</h3>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <p>정산 주기: 매월 1일 (전월 1일~말일 기준)</p>
              <p>지급 방식: 영업일 기준 3일 이내 자동 이체</p>
              <p>수수료: 서비스 약관에 따른 0% 부과</p>
            </div>
            <button className="text-sm text-gray-600 underline hover:text-gray-800">
              [정산 정책 상세 내용 보기]
            </button>
          </div>
        </div>
      )}

      {/* 근무 환경 탭 */}
      {activeTab === "workEnvironment" && (
        <div className="space-y-6">
          {/* 주요 활동 지역 설정 */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
            <h3 className="text-xl font-black text-gray-800 mb-4">주요 활동 지역 설정</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={workEnvironment.searchQuery}
                  onChange={(e) =>
                    setWorkEnvironment({ ...workEnvironment, searchQuery: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="검색창"
                />
                {workEnvironment.searchQuery && (
                  <button
                    onClick={() => setWorkEnvironment({ ...workEnvironment, searchQuery: "" })}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
                
                {/* 검색 결과 표시 - 검색창 바로 아래 붙여서 */}
                {workEnvironment.searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                    {searchResults
                      .filter((area) => !workEnvironment.selectedAreas.includes(extractGu(area)))
                      .map((area) => (
                        <button
                          key={area}
                          onClick={() => {
                            const guOnly = extractGu(area);
                            if (workEnvironment.selectedAreas.length < 3) {
                              setWorkEnvironment({
                                ...workEnvironment,
                                selectedAreas: [...workEnvironment.selectedAreas, guOnly],
                                searchQuery: "",
                              });
                            }
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all border-b border-gray-100 last:border-b-0 text-sm font-medium text-gray-800 hover:text-blue-600"
                        >
                          {area}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-2">선택 항목</p>
                  <div className="flex gap-2 flex-wrap">
                    {workEnvironment.selectedAreas.map((area) => (
                      <span
                        key={area}
                        className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800 flex items-center gap-2"
                      >
                        {area}
                        <button
                          onClick={() => {
                            setWorkEnvironment({
                              ...workEnvironment,
                              selectedAreas: workEnvironment.selectedAreas.filter((a) => a !== area),
                            });
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {workEnvironment.selectedAreas.length >= 3 && (
                  <p className="text-xs text-gray-500 mb-2">최대 3개까지 설정</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              *대타 추천 시 기본 필터로 사용됩니다.
            </p>
          </div>

          {/* 시간대/달력 표시 방식 설정 */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
            <h3 className="text-xl font-black text-gray-800 mb-6">시간대/달력 표시 방식 설정</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">주 시작 요일</p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() =>
                      setWorkEnvironment({ ...workEnvironment, weekStartDay: "월" })
                    }
                    className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
                      workEnvironment.weekStartDay === "월"
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-800 border border-gray-300"
                    }`}
                  >
                    월
                  </button>
                  <button
                    onClick={() =>
                      setWorkEnvironment({ ...workEnvironment, weekStartDay: "일" })
                    }
                    className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
                      workEnvironment.weekStartDay === "일"
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-800 border border-gray-300"
                    }`}
                  >
                    일
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">24시간제(오전/오후)</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setWorkEnvironment({
                        ...workEnvironment,
                        use24Hour: !workEnvironment.use24Hour,
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      workEnvironment.use24Hour ? "bg-gray-800" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        workEnvironment.use24Hour ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs text-gray-500">예) 00:00~23:59</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Settings;
