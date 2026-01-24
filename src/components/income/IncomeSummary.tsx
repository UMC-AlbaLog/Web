// components/income/IncomeSummary.tsx
import { useMemo } from "react";

interface IncomeSummaryProps {
  expectedIncome: number;
  currentMonthIncome: number;
  monthOverMonthGrowth: number;
}

const IncomeSummary = ({
  expectedIncome,
  currentMonthIncome,
  monthOverMonthGrowth,
}: IncomeSummaryProps) => {
  const now = new Date();
  const monthName = `${now.getMonth() + 1}월`;

  const percentage = useMemo(() => {
    if (expectedIncome === 0) return 0;
    return Math.min((currentMonthIncome / expectedIncome) * 100, 100);
  }, [currentMonthIncome, expectedIncome]);

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-2">{monthName} 예상 수입 / 실제 수입</h2>

      <p className="text-sm text-gray-500">예상: {expectedIncome.toLocaleString()}원</p>
      <p className="text-xl font-bold">실제: {currentMonthIncome.toLocaleString()}원</p>

      <div className="mt-4 h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-gray-700 rounded transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {monthOverMonthGrowth >= 0 ? "▲" : "▼"} 지난달 대비{" "}
        {Math.abs(monthOverMonthGrowth).toFixed(1)}%{" "}
        {monthOverMonthGrowth >= 0 ? "증가" : "감소"}
      </p>
    </div>
  );
};

export default IncomeSummary;
