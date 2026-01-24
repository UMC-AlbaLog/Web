// pages/Income.tsx
import IncomeSummary from "../components/income/IncomeSummary";
import IncomeChart from "../components/income/IncomeChart";
import IncomeGoal from "../components/income/IncomeGoal";
import SettlementTable from "../components/income/SettlementTable";
import { useIncome } from "../hooks/useIncome";

const Income = () => {
  const {
    currentMonthIncome,
    expectedIncome,
    monthOverMonthGrowth,
    incomeByStore,
    completedWorks,
    updateSettlementStatus,
  } = useIncome();

  return (
    <main className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800">수입</h1>
        <p className="text-gray-500 text-sm mt-2">내 수입 현황을 확인하세요</p>
      </div>
      <div className="space-y-6">
        {/* 상단 요약 */}
        <IncomeSummary
          expectedIncome={expectedIncome}
          currentMonthIncome={currentMonthIncome}
          monthOverMonthGrowth={monthOverMonthGrowth}
        />

        {/* 차트 + 목표 */}
        <div className="grid grid-cols-2 gap-6">
          <IncomeChart incomeByStore={incomeByStore} />
          <IncomeGoal currentMonthIncome={currentMonthIncome} />
        </div>

        {/* 하단: 정산 리스트 */}
        <SettlementTable
          completedWorks={completedWorks}
          updateSettlementStatus={updateSettlementStatus}
        />
      </div>
    </main>
  );
};

export default Income;
