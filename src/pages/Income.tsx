// pages/Income.tsx
import IncomeSummary from "../components/income/IncomeSummary";
import IncomeChart from "../components/income/IncomeChart";
import IncomeGoal from "../components/income/IncomeGoal";
import SettlementTable from "../components/income/SettlementTable";

import type {
  Work,
  SettlementStatus,
  WorkStatus,
} from "../types/work";

const Income = () => {
  /* =====================================================
   * 1. 상단 요약 더미데이터 (IncomeSummary)
   * ===================================================== */
  const incomeSummaryData = {
    expectedIncome: 3000000,
    currentMonthIncome: 2450000,
    monthOverMonthGrowth: 12.5,
  };


  const incomeByStore: { name: string; value: number }[] = [
    { name: "강남점", value: 1200000 },
    { name: "홍대점", value: 850000 },
    { name: "신촌점", value: 400000 },
  ];


  const currentMonthIncome = incomeSummaryData.currentMonthIncome;

  const completedWorks: Work[] = [
    {
      id: "work-1",
      name: "강남점",
      address: "서울 강남구 테헤란로",
      time: "09:00 ~ 18:00",
      duration: 8,
      pay: 15000,
      expectedPay: 120000,
      actualPay: 120000,
      status: "done" as WorkStatus,
      memo: "",
      date: "2026-01-10",
      settlementStatus: "completed" as SettlementStatus,
      description: "매장 계산 및 고객 응대",
      requirements: "성실한 근무 가능자",
      notice: "검은 티셔츠 착용",
    },
    {
      id: "work-2",
      name: "홍대점",
      address: "서울 마포구 홍익로",
      time: "13:00 ~ 19:00",
      duration: 6,
      pay: 15000,
      expectedPay: 90000,
      status: "done" as WorkStatus,
      memo: "",
      date: "2026-01-08",
      settlementStatus: "pending" as SettlementStatus,
      description: "홀 서빙",
      requirements: "서비스 마인드 필수",
      notice: "근무 10분 전 도착",
    },
  ];

  /* =====================================================
   * 5. 정산 상태 변경 함수
   * ===================================================== */
  const updateSettlementStatus = (
    workId: string,
    status: SettlementStatus,
    actualPay?: number
  ) => {
    console.log("정산 상태 변경", {
      workId,
      status,
      actualPay,
    });
  };

  /* =====================================================
   * 6. 렌더링
   * ===================================================== */
  return (
    <div className="space-y-6">
      {/* 상단 요약 */}
      <IncomeSummary {...incomeSummaryData} />

      {/* 차트 + 목표 */}
      <div className="grid grid-cols-2 gap-6">
        <IncomeChart incomeByStore={incomeByStore} />
        <IncomeGoal currentMonthIncome={currentMonthIncome} />
      </div>

      {/* 하단 정산 테이블 */}
      <SettlementTable
        completedWorks={completedWorks}
        updateSettlementStatus={updateSettlementStatus}
      />
    </div>
  );
};

export default Income;
