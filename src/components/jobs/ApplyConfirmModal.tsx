import React, { useState } from "react";

interface Props {
  job: any;
  onConfirm: () => void;
  onClose: () => void;
}

const ApplyConfirmModal: React.FC<Props> = ({ job, onConfirm, onClose }) => {
  const [checkedList, setCheckedList] = useState([false, false, false]);

  const checkTexts = [
    "[필수] 공고의 상세 업무 내용을 모두 확인하고 숙지했습니다.",
    "[필수] 지원 승인 시 취소할 수 없으며 취소 시 서비스 약관에 따라 패널티가 부과될 수 있음을 확인합니다.",
    "[필수] 약속된 시간에 근무지에 정확히 도착하겠습니다."
  ];

  const isAllChecked = checkedList.every(Boolean);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-1000">
      <div className="bg-white rounded-4xl w-120 p-10 relative font-['Pretendard']">
        <button onClick={onClose} className="absolute right-8 top-8 text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        
        <h2 className="text-2xl font-black mb-8 text-gray-900 text-left">{job.storeName} 지원</h2>
        
        <div className="space-y-5 mb-10 text-left text-[15px]">
          <div className="flex">
            <span className="w-32 text-gray-400 font-bold shrink-0">근무 일시</span>
            <span className="font-bold text-gray-900">{job.workDate} ({job.dayOfWeek})<br/>{job.startTime} ~ {job.endTime}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-400 font-bold shrink-0">총 근무 시간</span>
            <span className="font-bold text-gray-900">{job.workTime} 시간</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-400 font-bold shrink-0">시급</span>
            <span className="font-bold text-gray-900">{job.hourlyRate?.toLocaleString()}원</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-400 font-bold shrink-0">예상 급여</span>
            <span className="font-black text-gray-900">{job.totalWage?.toLocaleString()}원</span>
          </div>
        </div>

        <div className="space-y-4 mb-10 text-left">
          <p className="text-sm font-black text-gray-900 mb-2">지원 전 필수 확인 사항</p>
          {checkTexts.map((text, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={checkedList[i]}
                onChange={() => {
                  const next = [...checkedList];
                  next[i] = !next[i];
                  setCheckedList(next);
                }}
                className="mt-0.5 w-5 h-5 accent-[#5D5FEF] shrink-0 rounded" 
              />
              <span className={`text-[13px] font-bold leading-snug ${checkedList[i] ? "text-gray-900" : "text-gray-400"}`}>
                {text}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-[#F2F4F7] py-4 rounded-xl font-bold text-gray-500 text-lg hover:bg-gray-200 transition-colors">취소하기</button>
          <button 
            onClick={() => isAllChecked ? onConfirm() : alert("모든 필수 항목을 확인해 주세요.")}
            disabled={!isAllChecked}
            className={`flex-1 py-4 rounded-xl font-bold text-white text-lg transition-all ${
              isAllChecked ? "bg-[#5D5FEF] hover:bg-[#4A4BCF] shadow-md" : "bg-[#C4C5FA] cursor-not-allowed"
            }`}
          >
            지원하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyConfirmModal;