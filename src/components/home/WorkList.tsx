import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapModal from "./MapModal";
import type { Work } from "../../types/work";

interface WorkListProps {
  work: Work & { category?: string; storeId?: string }; 
  onAction: () => void;
}

const WorkList: React.FC<WorkListProps> = ({ work, onAction }) => {
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const { status, name, category, time, duration, pay, expectedPay, address, id } = work;

  const isDone = status === "done" || status === "settled" || status === "pending";
  const isWorking = status === "working";
  const isScheduled = status === "scheduled";
  const isAbsent = status === "absent";

  const badgeStyle = isDone
    ? "bg-gray-100 text-gray-500" 
    : isAbsent 
      ? "bg-red-50 text-red-400" 
      : isWorking 
        ? "bg-blue-100 text-blue-600" 
        : "bg-[#F2F3FF] text-[#5D5FEF]";

  const getStatusLabel = () => {
    if (status === "settled") return "정산 완료";
    if (isDone) return "근무 완료";
    if (isWorking) return "근무 중";
    if (isAbsent) return "결근";
    return "출근 예정";
  };

  return (
    <div 
      onClick={() => isDone && navigate(`/review/write/${id}`)}
      className={`bg-white p-8 rounded-[35px] relative border border-gray-50 transition-all ${
        isDone ? 'opacity-60 cursor-pointer hover:bg-gray-50' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex flex-col items-start text-left w-full font-['Pretendard']">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black mb-6 ${badgeStyle}`}>
          {getStatusLabel()}
        </span>

        <div className="flex justify-between items-end w-full mb-8">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400">{category || "기타"}</p>
            <h3 className="text-2xl font-black text-gray-800 leading-tight">{name}</h3>
          </div>

          <div className="flex gap-10">
            <InfoGroup label="근무 시간대" value={`${time} (${duration}시간)`} />
            <InfoGroup label="시급" value={`${pay.toLocaleString()}원 (총 ${expectedPay.toLocaleString()}원)`} />
          </div>
        </div>

        {!isDone && !isAbsent && (
          <div className="flex gap-3 w-full">
            {(isScheduled || isWorking) && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAction(); }}
                className={`flex-1 py-4.5 rounded-[22px] text-sm font-black text-white shadow-lg transition-all active:scale-95 
                  ${isWorking ? "bg-red-400" : "bg-[#5D5FEF]"}`}
              >
                {isWorking ? "퇴근하기" : "출근하기"}
              </button>
            )}
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