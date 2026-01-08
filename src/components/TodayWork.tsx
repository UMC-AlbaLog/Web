import React from "react";

interface TodayWorkProps {
  onAddClick: () => void;
}

const TodayWork: React.FC<TodayWorkProps> = ({ onAddClick }) => {
  return (
    <div className="bg-gray-200 rounded-[40px] p-12 text-center shadow-inner flex-1 flex flex-col justify-center items-center h-full min-h-0">
      <div className="text-7xl font-black mb-6 text-gray-800">!</div>
      <p className="text-2xl font-extrabold text-gray-800 mb-2">
        아직 등록된 알바 일정이 없어요
      </p>
      <p className="text-gray-500 mb-10 font-medium">알바 일정을 추가해주세요</p>

      <button 
        onClick={onAddClick}
        className="bg-yellow-400 hover:bg-yellow-500 px-12 py-5 rounded-3xl font-black text-xl shadow-lg shadow-yellow-400/30 transition-all active:scale-95"
      >
        알바 일정 추가
      </button>
    </div>
  );
};

export default TodayWork;