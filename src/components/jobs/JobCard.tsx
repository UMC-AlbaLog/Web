import React from "react";
import type { Work } from "../../types/work";
import { formatTimeString, getUse24HourSetting } from "../../utils/timeFormat";

interface Props {
  job: Work;
  distanceStr: string;
  onNavigate: (id: string) => void;
}

const JobCard: React.FC<Props> = ({ job, distanceStr, onNavigate }) => {
  const isHighPay = job.pay >= 11500;
  
  const getFormattedTime = (timeStr: string) => {
    if (!timeStr) return "";
    
    if (timeStr.includes('~')) {
      try {
        const [startStr, endStr] = timeStr.split('~');
        const start = new Date(startStr);
        const end = new Date(endStr);
        
        const pad = (n: number) => String(n).padStart(2, '0');
        
        return `${pad(start.getUTCHours())}:${pad(start.getUTCMinutes())} ~ ${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())}`;
      } catch (e) {
        return timeStr;
      }
    }
    
    return formatTimeString(timeStr, getUse24HourSetting());
  };

  const formattedTime = getFormattedTime(job.time);
  
  return (
    <div 
      onClick={() => onNavigate(job.id)}
      className="bg-white p-6 rounded-xl border border-gray-100 flex justify-between items-start cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold text-white ${isHighPay ? 'bg-[#5D5FEF]' : 'bg-[#4A7DFF]'}`}>
            {isHighPay ? "급구" : "당일정산"}
          </span>
          <span className="text-[16px] font-black text-gray-900">시급 {job.pay.toLocaleString()}원</span>
        </div>

        <h3 className="text-[15px] font-bold text-gray-800">{job.name}</h3>

        <div className="text-[13px] text-gray-400 font-medium">
          <p>{formattedTime}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(job.id);
          }}
          className="px-5 py-2 bg-[#E5E7EB] text-gray-700 rounded-lg text-[13px] font-bold">
          지원하기
        </button>
        <span className="text-[12px] text-gray-400 font-medium">{distanceStr}</span>
      </div>
    </div>
  );
};

export default JobCard;