import React from "react";

const QuickAction: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => (
  <div className="bg-white p-8 rounded-[35px] shadow-sm border border-white text-left">
    <h3 className="font-pretendard font-bold text-[20px] leading-[100%] align-middle text-gray-600 mb-6">빠른 액션</h3>
    <button 
      onClick={onAddClick}
      className="group flex items-center gap-3 w-full text-left"
    >
      <div className="w-5 h-5 bg-gray-100 rounded-sm group-hover:bg-purple-100 transition-colors" />
      <span className="text-sm font-black text-gray-800">알바 일정 직접 추가</span>
    </button>
  </div>
);

export default QuickAction;