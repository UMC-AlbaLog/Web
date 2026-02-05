import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapModal from "./MapModal";
import type { Work } from "../../types/work";

interface WorkListProps {
  work: Work & { category?: string };
  onAction: () => void;
  onDelete: () => void;
}

const WorkList: React.FC<WorkListProps> = ({ work, onAction, onDelete }) => {
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const { status, name, category, time, duration, pay, expectedPay, address, id } = work;

  const isDone = status === "completed" || status === "pending";
  const isScheduled = status === "scheduled";

  const badgeStyle = isDone 
    ? "bg-gray-100 text-gray-500" 
    : "bg-[#F2F3FF] text-[#5D5FEF]";

  return (
    <div 
      onClick={() => isDone && navigate(`/review/${id}`)}
      className={`bg-white p-8 rounded-[35px] relative border border-gray-50 transition-all ${
        isDone ? 'opacity-60 cursor-pointer hover:bg-gray-50' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
        className="absolute right-7 top-7 text-gray-300 hover:text-red-400 z-10 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex flex-col items-start text-left w-full">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black mb-6 ${badgeStyle}`}>
          {isDone ? "근무 완료" : "출근 예정"}
        </span>

        <div className="flex justify-between items-end w-full mb-8">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400">{category || "기타"}</p>
            <h3 className="text-2xl font-black text-gray-800 leading-tight">{name}</h3>
          </div>

          <div className="flex gap-10 font-['Pretendard']">
            <InfoGroup label="근무 시간대" value={`${time} (${duration}시간)`} />
            <InfoGroup label="시급" value={`${pay.toLocaleString()}원 (총 ${expectedPay.toLocaleString()}원)`} />
          </div>
        </div>

        {isScheduled && (
          <div className="flex gap-3 w-full">
            <button 
              onClick={(e) => { e.stopPropagation(); onAction(); }}
              className="flex-1 py-4.5 rounded-[22px] text-sm font-black text-white shadow-lg shadow-indigo-100 transition-all active:scale-95 bg-[#5D5FEF]"
            >
              출근하기
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsMapOpen(true); }}
              className="bg-[#F5F6FA] text-gray-600 px-10 py-4.5 rounded-[22px] text-sm font-black hover:bg-gray-200 transition-colors"
            >
              출근 위치 보기
            </button>
          </div>
        )}
      </div>
      
      {isMapOpen && <MapModal title={name} address={address} onClose={() => setIsMapOpen(false)} />}
    </div>
  );
};

const InfoGroup = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-bold text-gray-400">{label}</p>
    <p className="text-sm font-black text-gray-700">{value}</p>
  </div>
);

export default WorkList;