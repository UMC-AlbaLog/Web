// components/income/IncomeGoal.tsx
import { useState, useEffect } from "react";
import api from "../../api/client";

interface Props {
  currentMonthIncome: number;
  incomeGoal: number;
  onGoalChange: (goal: number) => void;
  monthOverMonthGrowth?: number;
}

const IncomeGoal = ({
  currentMonthIncome,
  incomeGoal,
  onGoalChange,
  monthOverMonthGrowth = 0,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState("");

  useEffect(() => {
    setTempGoal(incomeGoal.toString());
  }, [incomeGoal]);

  const percent =
    incomeGoal > 0
      ? Math.min((currentMonthIncome / incomeGoal) * 100, 100)
      : 0;

  const handleSave = async () => {
    const value = Number(tempGoal.replace(/,/g, ""));

    if (isNaN(value) || value <= 0) {
      setIsEditing(false);
      return;
    }

    try {
      await api.patch("/api/users/income-goal", {
        incomeGoal: value,
      });

      onGoalChange(value);
      setIsEditing(false);
    } catch (err) {
      console.error("목표 수정 실패:", err);
      alert("목표 수정 실패");
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-blue-950/50 rounded-[35px] p-6 h-96 flex flex-col">
      <h3 className="text-white text-2xl font-semibold mb-2">
        목표 달성률
      </h3>

      <p className="text-zinc-300 text-base mb-2 text-center">
        목표 {incomeGoal.toLocaleString()}원 기준
      </p>

      <button
        onClick={() => setIsEditing(true)}
        className="text-white underline mb-2"
      >
        목표 금액 수정
      </button>

      {isEditing && (
        <input
          autoFocus
          type="text"
          value={tempGoal}
          onChange={(e) => setTempGoal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-40 px-2 py-1 rounded bg-white/10 text-white border border-white/30"
        />
      )}

      <div className="flex-1 flex flex-col justify-end items-end">
        <p className="text-zinc-300 text-base mb-1 text-right w-36">
          {monthOverMonthGrowth >= 0 ? "▲" : "▼"} 지난달 대비{" "}
          {Math.abs(monthOverMonthGrowth).toFixed(1)}%
        </p>

        <div className="inline-flex items-center gap-3">
          <span className="text-white text-5xl font-bold">
            {Math.round(percent)}
          </span>
          <span className="text-white text-3xl font-medium">%</span>
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
