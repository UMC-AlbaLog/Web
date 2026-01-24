// components/income/IncomeGoal.tsx
import { useState, useEffect } from "react";

interface IncomeGoalProps {
  currentMonthIncome: number;
}

const GOAL_STORAGE_KEY = "income_goal";

const IncomeGoal = ({ currentMonthIncome }: IncomeGoalProps) => {
  const [goal, setGoal] = useState(600000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());

  // 목표 금액 로드
  useEffect(() => {
    const savedGoal = localStorage.getItem(GOAL_STORAGE_KEY);
    if (savedGoal) {
      const goalValue = Number(savedGoal);
      if (!isNaN(goalValue) && goalValue > 0) {
        setGoal(goalValue);
        setTempGoal(goalValue.toString());
      }
    }
  }, []);

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
    <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
      <div>
        <h3 className="font-semibold mb-4">수입 목표</h3>

        {/* 목표 금액 */}
        <div
          className="text-sm text-gray-500 cursor-pointer"
          onDoubleClick={() => setIsEditing(true)}
        >
          목표:{" "}
          {isEditing ? (
            <input
              autoFocus
              className="border px-2 py-1 rounded w-32 text-black"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          ) : (
            `${goal.toLocaleString()}원`
          )}
        </div>

        <p className="text-lg font-bold mt-2">
          현재: {currentMonthIncome.toLocaleString()}원
        </p>

        {/* 진행 바 */}
        <div className="mt-4 h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-gray-700 rounded transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeGoal;
