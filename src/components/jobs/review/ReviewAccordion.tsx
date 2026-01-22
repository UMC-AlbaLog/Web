import React from "react";

interface Props {
  title: string; avgRating: string; mode: "view" | "write"; isOpen: boolean;
  onToggle: () => void; children: React.ReactNode; reviews: any[];
  expandedReviews: Set<string>; onReadMore: (id: string) => void;
}

const ReviewAccordion: React.FC<Props> = ({ title, avgRating, mode, isOpen, onToggle, children, reviews, expandedReviews, onReadMore }) => (
  <section className="bg-white rounded-[40px] shadow-sm border border-white overflow-hidden transition-all">
    <div 
      className={`p-10 cursor-pointer ${isOpen && mode === 'view' ? 'bg-gray-50' : ''}`} 
      onClick={() => mode === 'view' && onToggle()}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-800">{title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-black text-gray-800">{avgRating}</span>
            <span className="text-lg text-gray-400 font-bold">/ 5.0</span>
          </div>
        </div>
        <div className={`text-6xl text-yellow-400 transition-all ${isOpen && mode === 'view' ? 'scale-110' : 'opacity-20'}`}>★</div>
      </div>
      {children}
      {mode === 'view' && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center text-xs font-black text-gray-400">
          {isOpen ? '리뷰 접기 ▲' : '리뷰 전체 보기 ▼'}
        </div>
      )}
    </div>
    {mode === 'view' && isOpen && (
      <div className="bg-gray-50 p-8 space-y-4 border-t border-gray-100">
        {reviews.map((r: any) => (
          <div key={r.id} className="bg-white p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex justify-between text-sm font-black text-gray-800">
              <span>{r.author}</span><span className="text-[10px] text-gray-400">{r.date}</span>
            </div>
            <p className="text-xs font-bold text-gray-500 text-left">
              {expandedReviews.has(r.id) || r.content.length <= 60 ? r.content : `${r.content.slice(0, 60)}...`}
            </p>
            {r.content.length > 60 && (
              <button onClick={(e) => { e.stopPropagation(); onReadMore(r.id); }} className="text-[10px] font-black text-blue-500">
                {expandedReviews.has(r.id) ? '접기' : '더보기'}
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
);

export default ReviewAccordion;