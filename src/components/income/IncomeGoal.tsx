// components/income/IncomeGoal.tsx
import { useState, useEffect } from "react";

const GOAL_STORAGE_KEY = "income_goal";

interface IncomeGoalProps {
  currentMonthIncome: number;
  monthOverMonthGrowth?: number;
  /** API 대시보드에서 내려준 수입 목표 (있으면 우선 표시) */
  incomeGoalFromApi?: number;
}

const IncomeGoal = ({ currentMonthIncome, monthOverMonthGrowth = 0, incomeGoalFromApi }: IncomeGoalProps) => {
  const [goal, setGoal] = useState(incomeGoalFromApi ?? 600000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());

  useEffect(() => {
    if (incomeGoalFromApi != null && incomeGoalFromApi > 0) {
      setGoal(incomeGoalFromApi);
      setTempGoal(incomeGoalFromApi.toString());
      return;
    }
    const savedGoal = localStorage.getItem(GOAL_STORAGE_KEY);
    if (savedGoal) {
      const goalValue = Number(savedGoal);
      if (!isNaN(goalValue) && goalValue > 0) {
        setGoal(goalValue);
        setTempGoal(goalValue.toString());
      }
    }
  }, [incomeGoalFromApi]);

  const percent = Math.min((currentMonthIncome / goal) * 100, 100);

  const handleSave = () => {
    const value = Number(tempGoal.replace(/,/g, ""));
    if (!isNaN(value) && value > 0) {
      setGoal(value);
      localStorage.setItem(GOAL_STORAGE_KEY, value.toString());
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-blue-950/50 rounded-[35px] overflow-hidden p-6 h-96 flex flex-col">
      <h3 className="text-white text-2xl font-semibold font-['Pretendard'] mb-2">
        목표 달성률
      </h3>
      <p className="text-zinc-300 text-base font-normal font-['Pretendard'] mb-2 text-center">
        목표 {goal.toLocaleString()}원 기준
      </p>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-white text-lg font-normal font-['Pretendard'] underline mb-2"
      >
        목표 금액 수정
      </button>
      {isEditing ? (
        <div className="mb-4">
          <input
            autoFocus
            type="text"
            value={tempGoal}
            onChange={(e) => setTempGoal(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-32 px-2 py-1 rounded bg-white/10 text-white border border-white/30"
          />
        </div>
      ) : null}
      <div className="flex-1 flex flex-col justify-end items-end">
        <p className="text-zinc-300 text-base font-normal font-['Pretendard'] mb-1 text-right w-36">
          {monthOverMonthGrowth >= 0 ? "▲" : "▼"}지난달 대비{" "}
          {Math.abs(monthOverMonthGrowth).toFixed(1)}%{" "}
          {monthOverMonthGrowth >= 0 ? "증가" : "감소"}
        </p>
        <div className="inline-flex items-center gap-3">
          <span className="text-white text-5xl font-bold font-['Pretendard']">
            {Math.round(percent)}
          </span>
          <span className="text-white text-3xl font-medium font-['Pretendard']">%</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-white/50 rounded-xl overflow-hidden mt-4">
        <div
          className="h-1.5 bg-white rounded-xl transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default IncomeGoal;
