import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapModal from "./MapModal";
import type { Work } from "../types/work";

interface WorkListProps {
  work: Work;
  onAction: () => void;
  onDelete: () => void;
}

const WorkList: React.FC<WorkListProps> = ({ work, onAction, onDelete }) => {
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const isWorking = work.status === "working";
  const isDone = work.status === "done";
  const statusColor = isDone ? "border-gray-300" : isWorking ? "border-blue-400" : "border-yellow-400";

  return (
    <div 
      onClick={() => isDone && navigate(`/review/${work.id}`)}
      className={`bg-white p-8 rounded-[30px] shadow-sm border-l-10 ${statusColor} relative transition-all ${isDone ? 'opacity-70 cursor-pointer hover:bg-gray-50' : ''}`}
    >
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute right-6 top-6 text-gray-300 hover:text-red-500 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className={`text-xl font-extrabold ${isDone ? 'text-gray-400' : 'text-gray-800'}`}>{work.name}</h3>
            {isWorking && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold animate-pulse">근무 중</span>}
            {isDone && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">근무 완료</span>}
          </div>
          <p className="text-gray-400 text-xs">{work.address}</p>
          <p className="text-sm font-bold text-gray-700 mt-2">
            수령액 <span className="text-lg">{work.expectedPay.toLocaleString()}원</span>
            {!isDone && <span className="ml-1 text-gray-400 text-xs">(예정)</span>}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-10">
          {!isDone ? (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onAction(); }}
                className={`${isWorking ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-yellow-400 hover:bg-yellow-500 text-black"} min-w-30 py-3 rounded-2xl text-sm font-extrabold shadow-md`}
              >
                {isWorking ? "퇴근하기" : "출근하기"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsMapOpen(true); }}
                className="bg-gray-50 text-gray-500 min-w-30 py-3 rounded-2xl text-sm font-bold border border-gray-100 hover:bg-gray-100">
                    출근 위치 보기
                </button>
            </>
          ) : (
            <div className="bg-yellow-100 text-yellow-700 p-4 rounded-2xl text-center text-xs font-bold border border-yellow-200">리뷰 작성하러 가기 ➔</div>
          )}
        </div>
      </div>
      
      {work.memo && work.memo.trim() !== "" && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
          <span className="text-lg">📒</span>
          <div>
            <p className="text-[10px] text-yellow-700 font-black mb-1">메모</p>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{work.memo}</p>
          </div>
        </div>
      )}
      {isMapOpen && <MapModal title={work.name} address={work.address} onClose={() => setIsMapOpen(false)} />}
    </div>
  );
};

export default WorkList;