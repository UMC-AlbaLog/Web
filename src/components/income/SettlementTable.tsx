// components/income/SettlementTable.tsx
import type { Work, SettlementStatus } from "../../types/work";

interface SettlementTableProps {
  completedWorks: Work[];
  updateSettlementStatus: (workId: string, status: SettlementStatus, actualPay?: number) => void;
}

const SettlementTable = ({
  completedWorks,
  updateSettlementStatus,
}: SettlementTableProps) => {
  // 날짜 포맷팅 (YYYY-MM-DD -> MM/DD)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day.toString().padStart(2, "0")}`;
  };

  // 시간 포맷팅 (duration -> "N시간")
  const formatDuration = (duration: number) => {
    return `${duration}시간`;
  };

  // 정산 상태에 따른 스타일
  const getStatusStyle = (status?: SettlementStatus) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status?: SettlementStatus) => {
    switch (status) {
      case "completed":
        return "정산 완료";
      case "pending":
        return "정산 대기";
      default:
        return "정산 대기";
    }
  };

  // 날짜순으로 정렬 (최신순)
  const sortedWorks = [...completedWorks].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-semibold mb-4">정산 상태 리스트</h3>

      {sortedWorks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>완료된 작업이 없습니다</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-gray-500">
              <th className="pb-2">근무일자</th>
              <th className="pb-2">매장명</th>
              <th className="pb-2">근무시간</th>
              <th className="pb-2">예상 수입</th>
              <th className="pb-2">실제 수입</th>
              <th className="pb-2">정산 상태</th>
            </tr>
          </thead>
          <tbody>
            {sortedWorks.map((work) => (
              <tr key={work.id} className="border-b">
                <td className="py-3">{formatDate(work.date)}</td>
                <td className="py-3">{work.name}</td>
                <td className="py-3">{formatDuration(work.duration)}</td>
                <td className="py-3">{work.expectedPay.toLocaleString()}원</td>
                <td className="py-3">
                  {(work.actualPay || work.expectedPay).toLocaleString()}원
                </td>
                <td className={`py-3 ${getStatusStyle(work.settlementStatus)}`}>
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
