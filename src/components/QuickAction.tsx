import React from "react";
import { useNavigate } from "react-router-dom";

const QuickAction: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 rounded-[35px] shadow-sm border border-white h-full flex flex-col justify-between">
      <h3 className="font-bold mb-4">빠른 액션</h3>
      <div className="space-y-4">
        <button 
          onClick={onAddClick}
          className="w-full p-5 bg-gray-50 rounded-[20px] text-left text-sm font-bold flex justify-between items-center transition-all hover:bg-gray-100"
        >
          알바 일정 직접 추가
          <span className="text-gray-300">▶</span>
        </button>
        <button 
          onClick={() => navigate("/schedule")}
          className="bg-[#FFD600] w-full py-5 rounded-[20px] font-black text-sm shadow-md transition-all hover:bg-yellow-400"
        >
          알바 일정 추가는 캘린더로 이동
        </button>
      </div>
    </div>
  );
};

export default QuickAction;