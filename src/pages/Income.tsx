// pages/Income.tsx
import IncomeSummary from "../components/income/IncomeSummary";
import IncomeChart from "../components/income/IncomeChart";
import IncomeGoal from "../components/income/IncomeGoal";
import SettlementTable from "../components/income/SettlementTable";

const Income = () => {
  return (
    <div className="space-y-6">
      {/* 상단 요약 */}
      <IncomeSummary />

      {/* 중단: 차트 + 목표 */}
      <div className="grid grid-cols-2 gap-6">
        <IncomeChart />
        <IncomeGoal />
      </div>

      {/* 하단: 정산 리스트 */}
      <SettlementTable />
    </div>
  );
};

export default Income;
