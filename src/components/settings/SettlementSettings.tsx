import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SettlementInfo, SettlementHistoryItem } from "../../api/settlement";
import { getSettlementHistory } from "../../api/settlement";
import { getUserIdFromToken } from "../../utils/userId";

interface SettlementSettingsProps {
  settlementData: SettlementInfo;
  isEditing: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSettlementDataChange: (data: Partial<SettlementInfo>) => void;
}

const SettlementSettings: React.FC<SettlementSettingsProps> = ({
  settlementData,
  isEditing,
  isLoading,
  onEdit,
  onSave,
  onCancel,
  onSettlementDataChange,
}) => {
  const navigate = useNavigate();

  // 기타 은행 선택 모달
  const [showOtherBanks, setShowOtherBanks] = useState(false);

  const mainBanks = [
    { name: "카카오뱅크", icon: "kakao" },
    { name: "토스뱅크", icon: "toss" },
    { name: "국민은행", icon: "kb" },
    { name: "신한은행", icon: "shinhan" },
    { name: "우리은행", icon: "woori" },
    { name: "기타", icon: "other" },
  ] as const;

  const otherBanks = [
    "기업은행",
    "농협은행",
    "하나은행",
    "SC제일은행",
    "수협은행",
    "한국씨티은행",
    "우체국은행",
    "케이뱅크",
    "대구은행",
    "부산은행",
    "경남은행",
    "광주은행",
    "전북은행",
    "제주은행",
    "새마을금고",
    "신협",
    "산업은행",
    "수출입은행",
    "한국개발은행",
    "NH농협은행",
    "NH투자증권",
    "KB증권",
    "미래에셋증권",
    "삼성증권",
    "한국투자증권",
    "키움증권",
    "대신증권",
    "교보증권",
    "하나금융투자",
    "신한금융투자",
  ];

  const [recentSettlements, setRecentSettlements] = useState<Array<{
    date: string;
    description: string;
    amount: string;
    status: string;
  }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 정산 내역 조회
  useEffect(() => {
    const loadSettlementHistory = async () => {
      // 편집 모드가 아닐 때만 조회
      if (isEditing) {
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        console.warn("정산 내역 조회: userId를 찾을 수 없습니다.");
        return;
      }

      try {
        setIsLoadingHistory(true);
        const data = await getSettlementHistory(userId, "all");
        
        // 최근 3개만 표시 (최신순)
        const sorted = [...data.settlements].sort((a, b) => 
          new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
        );
        
        const recent = sorted.slice(0, 3).map((item: SettlementHistoryItem) => {
          // 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
          const formattedDate = item.workDate.replace(/-/g, ".");
          
          // 상태 한글 변환
          const statusMap: Record<string, string> = {
            "paid": "지급완료",
            "waiting": "정산 대기",
            "unpaid": "미정산",
          };
          const statusText = statusMap[item.settlementStatus] || item.settlementStatus;
          
          // 금액 포맷팅
          const amount = item.actualIncome > 0 ? item.actualIncome : item.expectedIncome;
          const formattedAmount = `${amount.toLocaleString()}원`;
          
          return {
            date: formattedDate,
            description: item.storeName,
            amount: formattedAmount,
            status: statusText,
          };
        });
        
        setRecentSettlements(recent);
      } catch (error) {
        console.error("정산 내역 로드 실패:", error);
        setRecentSettlements([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadSettlementHistory();
  }, [isEditing]);

  if (!isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">정산 정보</h2>

          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">급여 계좌 관리</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-gray-500">로딩 중...</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {settlementData.bankName ? settlementData.bankName.substring(0, 2) : "계좌"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-800">
                    {settlementData.bankName || "등록된 계좌가 없습니다"}
                  </p>
                  {settlementData.accountNumber && (
                    <p className="text-sm text-gray-600">{settlementData.accountNumber}</p>
                  )}
                </div>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {settlementData.bankName ? "변경" : "등록"}
                </button>
              </div>
            )}
          </div>

          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">최근 정산 내역</h3>
              <button 
                onClick={() => navigate("/settings/settlement-history")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                전체보기
              </button>
            </div>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-gray-500">로딩 중...</p>
              </div>
            ) : recentSettlements.length > 0 ? (
              <div className="space-y-3">
                {recentSettlements.map((settlement, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">{settlement.date}</p>
                      <p className="text-sm font-medium text-gray-800">{settlement.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{settlement.amount}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        settlement.status === "지급완료" 
                          ? "text-green-600 bg-green-50"
                          : settlement.status === "정산 대기"
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-gray-600 bg-gray-50"
                      }`}>
                        {settlement.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">정산 내역이 없습니다.</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="space-y-1 text-sm text-gray-700">
                <p>급여는 매주 목요일 일괄 정산되어 등록된 계좌로 입금됩니다.</p>
                <p>공휴일인 경우 전일 지급됩니다.</p>
                <p>3.3% 소득세 공제 후 금액이 입금됩니다.</p>
                <p>지급 내역에 이상이 있을 경우 고객센터로 문의해주세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-2">정산 계좌 변경</h2>
        <p className="text-sm text-gray-600 mb-8">급여 정산을 받으실 본인 명의의 계좌 정보를 입력해주세요.</p>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-800 mb-4">은행 선택</label>
          <div className="grid grid-cols-3 gap-3">
            {mainBanks.map((bank) => (
              <button
                key={bank.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (bank.name === "기타") {
                    setShowOtherBanks(true);
                  } else {
                    onSettlementDataChange({ bankName: bank.name });
                  }
                }}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  settlementData.bankName === bank.name
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-12 h-12 mb-2 mx-auto flex items-center justify-center">
                  {bank.icon === "kakao" && (
                    <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">K</span>
                    </div>
                  )}
                  {bank.icon === "toss" && (
                    <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">T</span>
                    </div>
                  )}
                  {bank.icon === "kb" && (
                    <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">KB</span>
                    </div>
                  )}
                  {bank.icon === "shinhan" && (
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">신한</span>
                    </div>
                  )}
                  {bank.icon === "woori" && (
                    <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">우리</span>
                    </div>
                  )}
                  {bank.icon === "other" && (
                    <div className="w-12 h-12 rounded-lg bg-gray-400 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className={`text-sm font-medium ${
                  settlementData.bankName === bank.name ? "text-blue-600" : "text-gray-700"
                }`}>
                  {bank.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">계좌번호</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="계좌번호를 입력하세요"
            value={settlementData.accountNumber}
            onChange={(e) => onSettlementDataChange({ accountNumber: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">예금주</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예금주를 입력하세요"
            value={settlementData.accountHolder}
            onChange={(e) => onSettlementDataChange({ accountHolder: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-2">본인 명의의 계좌만 등록 가능합니다.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "저장 중..." : "변경 완료"}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            취소
          </button>
        </div>
      </div>

      {/* 기타 은행 선택 모달 */}
      {showOtherBanks && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm"
          onClick={() => setShowOtherBanks(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">다른 은행 선택</h3>
              <button
                onClick={() => setShowOtherBanks(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              자주 사용하는 다른 은행을 선택해주세요.
            </p>

            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
              <ul className="divide-y divide-gray-200">
                {otherBanks.map((bank) => (
                  <li key={bank}>
                    <button
                      onClick={() => {
                        onSettlementDataChange({ bankName: bank });
                        setShowOtherBanks(false);
                      }}
                      className={`w-full px-4 py-3.5 flex items-center justify-between text-sm font-medium transition-colors ${
                        settlementData.bankName === bank
                          ? "bg-blue-50 text-blue-700"
                          : "bg-white hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <span className="font-semibold">{bank}</span>
                      {settlementData.bankName === bank && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowOtherBanks(false)}
              className="mt-4 w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementSettings;

