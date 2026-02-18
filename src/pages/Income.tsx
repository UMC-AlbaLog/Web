// src/pages/Income.tsx
import { useState, useEffect, useMemo } from "react";
import IncomeSummary from "../components/income/IncomeSummary";
import IncomeChart from "../components/income/IncomeChart";
import IncomeGoal from "../components/income/IncomeGoal";
import SettlementTable from "../components/income/SettlementTable";
import { fetchIncomeDashboard } from "../api/income";
import api from "../api/client";

/* =========================
 * Dashboard API 타입
 * ========================= */
interface IncomeDashboardApiResponse {
  resultType: string;
  success: {
    actualIncome: number;
    expectedIncome: number;
    incomeGoal: number;
    incomeChangeRate: number;
    breakdown: {
      key: string;
      income: number;
    }[];
  };
}

/* =========================
 * Settlement API 타입
 * ========================= */
interface SettlementApiItem {
  work_date: string;
  store_name: string;
  work_minutes: number;
  expected_income: number;
  amount: number;
  settlement_status: "waiting" | "paid" | "unpaid";
}

interface SettlementRow {
  id: string;
  date: string;
  name: string;
  duration: number;
  expectedPay: number;
  actualPay: number;
  settlementStatus?: "pending" | "completed";
}

const Income = () => {
  const now = new Date();
const [incomeChangeRate, setIncomeChangeRate] = useState(0);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthParam = useMemo(
    () => `${year}-${String(month).padStart(2, "0")}`,
    [year, month]
  );

  const isThisMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;

  /* =========================
   * Dashboard 상태
   * ========================= */
  const [actualIncome, setActualIncome] = useState(0);
  const [expectedIncome, setExpectedIncome] = useState(0);
  const [incomeGoal, setIncomeGoal] = useState(0);
  const [incomeByStore, setIncomeByStore] = useState<
    { name: string; value: number }[]
  >([]);

  /* =========================
   * Settlement 상태
   * ========================= */
  const [settlementRows, setSettlementRows] = useState<SettlementRow[]>([]);

  /* =========================
   * Dashboard API
   * ========================= */
  useEffect(() => {
    fetchIncomeDashboard(monthParam)
      .then((res) => {
        const data = res.data as IncomeDashboardApiResponse;
        const success = data.success;

        setActualIncome(success.actualIncome);
        setExpectedIncome(success.expectedIncome);
        setIncomeGoal(success.incomeGoal);
         setIncomeChangeRate(success.incomeChangeRate);
        setIncomeByStore(
          success.breakdown.map((b) => ({
            name: b.key,
            value: b.income,
          }))
        );

        console.log("Dashboard API 성공", data);
      })
      .catch((err) => {
        console.error("Dashboard API 실패", err);
        setActualIncome(0);
        setExpectedIncome(0);
        setIncomeGoal(0);
        setIncomeByStore([]);
      });
  }, [monthParam]);

  /* =========================
   * Settlement API
   * ========================= */
  useEffect(() => {
    api
      .get<{ items: SettlementApiItem[] }>("/api/settlement-status-list", {
        params: { status: "all", sort: "latest", size: 100 },
      })
      .then((res) => {
        const rows = res.data.items
          .filter((item) => item.work_date.startsWith(monthParam))
          .map((item, idx): SettlementRow => ({
            id: `${item.work_date}-${idx}`,
            date: item.work_date,
            name: item.store_name,
            duration: Math.round(item.work_minutes / 60),
            expectedPay: item.expected_income,
            actualPay: item.amount,
            settlementStatus:
              item.settlement_status === "waiting"
                ? "pending"
                : item.settlement_status === "paid"
                ? "completed"
                : undefined,
          }));
        setSettlementRows(rows);
        console.log("Settlement API 성공", res.data);
      })
      .catch(() => setSettlementRows([]));
  }, [monthParam]);

  /* =========================
   * 월 이동
   * ========================= */
  const goPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else setMonth(month - 1);
  };

  const goNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else setMonth(month + 1);
  };

  const goThisMonth = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const monthLabel = `${year}년 ${month}월`;

  return (
    <main className="p-8 bg-white flex-1 overflow-y-auto">
      <div className="bg-indigo-600 rounded-[47px] p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={goPrevMonth}>◀</button>
          <span className="text-white text-4xl font-bold">{month}월</span>
          <button onClick={goNextMonth}>▶</button>
          {!isThisMonth && <button onClick={goThisMonth}>이번 달</button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <IncomeGoal
            currentMonthIncome={actualIncome}
            incomeGoal={incomeGoal}
            onGoalChange={setIncomeGoal}
            monthOverMonthGrowth={incomeChangeRate}
          />
          <IncomeSummary
            expectedIncome={expectedIncome}
            currentMonthIncome={actualIncome}
             monthOverMonthGrowth={incomeChangeRate}
          />
          <IncomeChart incomeByStore={incomeByStore} />
        </div>
      </div>

      <SettlementTable
        completedWorks={settlementRows}
        titleSuffix={!isThisMonth ? ` (${monthLabel})` : undefined}
      />
    </main>
  );
};

export default Income;
