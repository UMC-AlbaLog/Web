import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSettlementHistory, type SettlementHistoryItem } from "../api/settlement";

interface Settlement {
  date: string;
  description: string;
  amount: string;
  status: string;
}

const SettlementHistory: React.FC = () => {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [allSettlements, setAllSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalExpectedIncome, setTotalExpectedIncome] = useState(0);
  const [totalActualIncome, setTotalActualIncome] = useState(0);

  // 정산 내역 조회 (언마운트 시 setState 방지)
  useEffect(() => {
    let cancelled = false;
    const loadSettlementHistory = async () => {
      try {
        setIsLoading(true);
        const data = await getSettlementHistory("all");
        if (cancelled) return;

        const settlements: Settlement[] = data.settlements.map((item: SettlementHistoryItem) => {
          const formattedDate = item.workDate.replace(/-/g, ".");
          const statusMap: Record<string, string> = {
            paid: "지급완료",
            waiting: "정산 대기",
            unpaid: "미정산",
          };
          const statusText = statusMap[item.settlementStatus] ?? item.settlementStatus;
          const amount = item.actualIncome > 0 ? item.actualIncome : item.expectedIncome;
          return {
            date: formattedDate,
            description: item.storeName,
            amount: `${amount.toLocaleString()}원`,
            status: statusText,
          };
        });

        setAllSettlements(settlements);
        setTotalExpectedIncome(data.totalExpectedIncome);
        setTotalActualIncome(data.totalActualIncome);
      } catch (error) {
        if (!cancelled) {
          console.error("정산 내역 로드 실패:", error);
          setAllSettlements([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSettlementHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedSettlements = [...allSettlements].sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  // 총 정산 금액은 API에서 받은 totalActualIncome 사용 (없으면 totalExpectedIncome)
  const totalAmount = totalActualIncome > 0 ? totalActualIncome : totalExpectedIncome;

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* 페이지 제목 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">정산 내역</h1>
          <button
            onClick={() => navigate("/settings")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 설정으로 돌아가기
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">전체 정산 건수</p>
            <p className="text-2xl font-bold text-gray-800">{allSettlements.length}건</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">총 정산 금액</p>
            <p className="text-2xl font-bold text-gray-800">{totalAmount.toLocaleString()}원</p>
          </div>
        </div>

        {/* 정렬 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <span>{sortOrder === "latest" ? "최신순" : "오래된순"}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 정산 내역 목록 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">전체 정산 내역</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">로딩 중...</p>
            </div>
          ) : sortedSettlements.length > 0 ? (
            <div className="space-y-3">
              {sortedSettlements.map((settlement, index) => (
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
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">정산 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementHistory;

