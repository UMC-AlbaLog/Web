import React from "react";

interface Props {
  title: string;
  avgRating: string;
  isOpen: boolean;
  onToggle: () => void;
  keywords?: string[];
  reviewText?: string;
  children?: React.ReactNode; 
}

const ReviewAccordion: React.FC<Props> = ({ 
  title, 
  avgRating, 
  isOpen, 
  onToggle, 
  keywords = [], 
  reviewText,
  children 
}) => {
  const keywordMap: Record<string, string> = {
    settlement: "💰 급여 칼지급",
    kindness: "😊 사장님이 친절해요",
    clean: "🧹 매장이 청결해요",
    rest: "☕ 휴게시간 준수",
    colleague: "🙌 동료가 좋아요",
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 space-y-6 text-left transition-all">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-black text-gray-800">{title}</h3>
        <div className="flex flex-col items-end gap-1">
          <div className="flex text-yellow-400 text-sm">★★★★★</div>
          <div className="text-sm font-bold text-gray-800">
            {avgRating} <span className="text-gray-300">/ 5.0</span>
          </div>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <span key={k} className="px-4 py-1.5 bg-indigo-50 text-[#5D5FEF] text-[11px] font-bold rounded-full border border-indigo-100">
              {keywordMap[k] || k}
            </span>
          ))}
        </div>
      )}

      {children && <div className="border-t border-gray-50 pt-4">{children}</div>}

      {reviewText && (
        <div 
          onClick={onToggle}
          className="bg-gray-100 rounded-xl p-5 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <p className="text-sm font-bold text-gray-600 truncate mr-4">{reviewText}</p>
          <svg className={`w-5 h-5 text-indigo-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}

      {isOpen && reviewText && (
        <div className="pt-2 px-1 text-sm font-medium text-gray-500 leading-relaxed whitespace-pre-wrap animate-fadeIn">
          {reviewText}
        </div>
      )}
    </section>
  );
};

export default ReviewAccordion;