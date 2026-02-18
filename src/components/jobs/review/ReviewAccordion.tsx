import React, { useState } from "react";

interface Props {
  title: string;
  rating: number;
  keywords: string[];
  reviewText: string;
}

const ReviewAccordion: React.FC<Props> = ({ title, rating, keywords, reviewText }) => {
  const [isOpen, setIsOpen] = useState(false);

  const keywordConfig: Record<string, { label: string; icon: string }> = {
    kindness: { label: "사장님이 친절해요", icon: "😊" },
    communication: { label: "동료가 좋아요", icon: "🙌" },
    settlement: { label: "급여 칼지급", icon: "💰" },
    rest: { label: "휴게시간 준수", icon: "☕" },
  };

  return (
    <section className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 space-y-6 text-left transition-all font-['Pretendard']">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-black text-gray-800">{title}</h3>
        <div className="flex flex-col items-end gap-1">
          <div className="flex text-[#FFD700] text-sm">
            {"★".repeat(Math.round(rating)).padEnd(5, "☆")}
          </div>
          <div className="text-sm font-bold text-gray-800">
            {rating.toFixed(1)} <span className="text-gray-300">/ 5.0</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <span key={k} className="px-4 py-2 bg-white text-[#5D5FEF] text-[12px] font-bold rounded-full border border-[#5D5FEF] flex items-center gap-1.5">
            <span>{keywordConfig[k]?.icon || "✨"}</span>
            {keywordConfig[k]?.label || k}
          </span>
        ))}
      </div>

      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#F1F3F9] rounded-xl p-5 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors"
      >
        <p className={`text-sm font-bold text-gray-600 ${!isOpen && 'truncate mr-4'}`}>
          {reviewText}
        </p>
        <svg className={`w-5 h-5 text-indigo-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};

export default ReviewAccordion;