// components/income/SettlementTable.tsx
import { useState } from "react";

/* ===============================
 * Income.tsx에서 내려주는 타입
 * =============================== */
export interface SettlementRow {
  id: string;
  name: string;
  date: string;
  duration: number; // 시간 단위
  expectedPay: number;
  actualPay: number;
  settlementStatus?: "pending" | "completed";
}

type FilterStatus = "all" | "pending" | "completed" | "unsettled";

interface SettlementTableProps {
  completedWorks: SettlementRow[];
  titleSuffix?: string;
}

/* ===============================
 * 컴포넌트
 * =============================== */
const SettlementTable = ({
  completedWorks,
  titleSuffix,
}: SettlementTableProps) => {
  const [filter, setFilter] = useState<FilterStatus>("all");

  /* 날짜 포맷 */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  /* 상태 텍스트 */
  const getStatusText = (status?: "pending" | "completed") => {
    switch (status) {
      case "completed":
        return "정산 완료";
      case "pending":
        return "정산 대기";
      default:
        return "미정산";
    }
  };

  /* 상태 스타일 */
  const getStatusStyle = (status?: "pending" | "completed") => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  /* 필터링 */
  const filteredWorks = completedWorks
    .filter((work) => {
      if (filter === "all") return true;
      if (filter === "unsettled") return !work.settlementStatus;
      return work.settlementStatus === filter;
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-semibold mb-3">
        정산 상태 리스트{titleSuffix}
      </h3>

      {/* 필터 버튼 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: "전체" },
          { key: "pending", label: "정산 대기" },
          { key: "completed", label: "정산 완료" },
          { key: "unsettled", label: "미정산" },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key as FilterStatus)}
            className={`px-3 py-1 text-sm border rounded ${
              filter === btn.key
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      {filteredWorks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          해당 상태의 작업이 없습니다
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th className="pb-2 text-left">근무일자</th>
              <th className="pb-2 text-left">매장명</th>
              <th className="pb-2 text-left">근무 시간</th>
              <th className="pb-2 text-left">예상 수입</th>
              <th className="pb-2 text-left">실제 수입</th>
              <th className="pb-2 text-left">정산 상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorks.map((work) => (
              <tr key={work.id} className="border-b">
                <td className="py-3">{formatDate(work.date)}</td>
                <td className="py-3">{work.name}</td>
                <td className="py-3">{work.duration}시간</td>
                <td className="py-3">
                  {work.expectedPay.toLocaleString()}원
                </td>
                <td className="py-3">
                  {work.actualPay.toLocaleString()}원
                </td>
                <td
                  className={`py-3 font-medium ${getStatusStyle(
                    work.settlementStatus
                  )}`}
                >
                  {getStatusText(work.settlementStatus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SettlementTable;
