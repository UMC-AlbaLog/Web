// pages/Income.tsx
import { useState, useMemo } from "react";
import IncomeSummary from "../components/income/IncomeSummary";
import IncomeChart from "../components/income/IncomeChart";
import IncomeGoal from "../components/income/IncomeGoal";
import SettlementTable from "../components/income/SettlementTable";
import { useIncome } from "../hooks/useIncome";

const Income = () => {
  const {
    getMonthlyIncome,
    getExpectedIncomeForMonth,
    getIncomeByStoreForMonth,
    getCompletedWorksForMonth,
    getPreviousMonth,
    updateSettlementStatus,
  } = useIncome();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const actualIncome = useMemo(
    () => getMonthlyIncome(selectedYear, selectedMonth),
    [getMonthlyIncome, selectedYear, selectedMonth]
  );
  const expectedIncome = useMemo(
    () => getExpectedIncomeForMonth(selectedYear, selectedMonth),
    [getExpectedIncomeForMonth, selectedYear, selectedMonth]
  );
  const incomeByStore = useMemo(
    () => getIncomeByStoreForMonth(selectedYear, selectedMonth),
    [getIncomeByStoreForMonth, selectedYear, selectedMonth]
  );
  const completedWorksForMonth = useMemo(
    () => getCompletedWorksForMonth(selectedYear, selectedMonth),
    [getCompletedWorksForMonth, selectedYear, selectedMonth]
  );

  const { year: prevYear, month: prevMonth } = getPreviousMonth(selectedYear, selectedMonth);
  const previousMonthIncome = useMemo(
    () => getMonthlyIncome(prevYear, prevMonth),
    [getMonthlyIncome, prevYear, prevMonth]
  );
  const monthOverMonthGrowth = useMemo(() => {
    if (previousMonthIncome === 0) return 0;
    return ((actualIncome - previousMonthIncome) / previousMonthIncome) * 100;
  }, [actualIncome, previousMonthIncome]);

  const goPrevMonth = () => {
    const prev = getPreviousMonth(selectedYear, selectedMonth);
    setSelectedYear(prev.year);
    setSelectedMonth(prev.month);
  };

  const goNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goThisMonth = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
  };

  const monthLabel = `${selectedYear}년 ${selectedMonth}월`;
  const isThisMonth =
    now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth;

  return (
    <main className="p-8 bg-white flex-1 overflow-y-auto">
      {/* 상단: indigo-600 영역 (Figma) */}
      <div className="bg-indigo-600 rounded-[47px] overflow-hidden p-8 mb-8">
        <div className="flex justify-start items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="w-10 h-10 rounded-xl border border-white/80 text-white flex items-center justify-center hover:bg-white/10"
              aria-label="이전 달"
            >
              ◀
            </button>
            <div className="w-48 h-14 rounded-2xl border-[1.5px] border-white/80 flex items-center justify-center">
              <span className="text-white text-4xl font-bold font-['Pretendard']">
                {selectedMonth}월
              </span>
            </div>
            <button
              type="button"
              onClick={goNextMonth}
              className="w-10 h-10 rounded-xl border border-white/80 text-white flex items-center justify-center hover:bg-white/10"
              aria-label="다음 달"
            >
              ▶
            </button>
          </div>
          {!isThisMonth && (
            <button
              type="button"
              onClick={goThisMonth}
              className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-medium hover:bg-white/30"
            >
              이번 달
            </button>
          )}
          <h1 className="text-white text-3xl font-medium font-['Pretendard']">
            알바 수입 한눈에 보기
          </h1>
        </div>

        {/* 실제 수입 카드 */}
        <div className="w-full max-w-full h-28 bg-indigo-800 rounded-[29px] flex items-center justify-between px-8 mb-6">
          <span className="text-white text-3xl font-bold font-['Pretendard']">
            실제 수입 {!isThisMonth && `(${monthLabel})`}
          </span>
          <div className="inline-flex items-center gap-3">
            <span className="text-white text-5xl font-bold font-['Pretendard']">
              {actualIncome.toLocaleString()}
            </span>
            <span className="text-white text-3xl font-medium font-['Pretendard']">
              원
            </span>
          </div>
        </div>

        {/* 목표 달성률 + 예상 수입 + 수입 분류 차트 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          <IncomeGoal
            currentMonthIncome={actualIncome}
            monthOverMonthGrowth={monthOverMonthGrowth}
          />
          <IncomeSummary
            expectedIncome={expectedIncome}
            currentMonthIncome={actualIncome}
            monthOverMonthGrowth={monthOverMonthGrowth}
          />
          <IncomeChart incomeByStore={incomeByStore} />
        </div>
      </div>

      {/* 하단: 해당 월 근무 (정산 테이블) */}
      <SettlementTable
        completedWorks={completedWorksForMonth}
        updateSettlementStatus={updateSettlementStatus}
        titleSuffix={!isThisMonth ? ` (${monthLabel})` : undefined}
      />
    </main>
  );
};

export default Income;
