import React from "react";

interface RecommendProps {
  onDetailClick: () => void;
}

const Recommend: React.FC<RecommendProps> = ({ onDetailClick }) => {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-extrabold text-gray-900">추천 아르바이트 요약</h2>
      
      <div className="bg-white p-6 rounded-[25px] flex justify-between items-center shadow-sm border border-white">
        <p className="text-gray-700 font-bold ml-4">
          00님에게 맞는 아르바이트 추천 공고입니다.
        </p>

        <button 
          onClick={onDetailClick}
          className="bg-[#D9D9D9] hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
        >
          자세히 보기
        </button>
      </div>
    </section>
  );
};

export default Recommend;