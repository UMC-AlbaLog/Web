import React, { useState } from "react";
import type { Work } from "../../types/work";

interface Props {
  job: Work;
  onConfirm: () => void;
  onClose: () => void;
}

const ApplyConfirmModal: React.FC<Props> = ({ job, onConfirm, onClose }) => {
  const [checkedList, setCheckedList] = useState([false, false, false]);

  const handleCheck = (index: number) => {
    const nextList = [...checkedList];
    nextList[index] = !nextList[index];
    setCheckedList(nextList);
  };

  const handleConfirmClick = () => {
    const isAllChecked = checkedList.every((checked) => checked === true);

    if (isAllChecked) {
      onConfirm();
    } else {
      alert("모든 필수 사항을 확인하고 체크해주세요! ");
    }
  };

  const checkTexts = [
    "[필수] 공고의 상세 업무 내용을 모두 확인하고 숙지했습니다.",
    "[필수] 지원 승인 시 취소할 수 없으며 취소 시 서비스 약관에 따라 패널티가 부과될 수 있음을 확인합니다. ",
    "[필수] 약속된 시간에 근무지에 정확히 도착하겠습니다."
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-110 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] w-112.5 p-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-8 top-8 text-2xl text-gray-400 hover:text-black">&times;</button>
        <h2 className="text-xl font-black mb-6 text-gray-800">{job.name} 지원</h2>
        
        <div className="bg-gray-50 p-6 rounded-2xl mb-6 space-y-2 text-left">
          <div className="flex justify-between text-sm"><span className="text-gray-400">근무 일시</span><span className="font-bold">{job.date} | {job.time}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">시급</span><span className="font-bold">{job.pay.toLocaleString()}원</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">예상 급여</span><span className="font-black text-[#5D5FEF]">{job.expectedPay.toLocaleString()}원</span></div>
        </div>

        <div className="space-y-4 mb-8 text-left">
          <p className="text-xs font-black text-gray-800">지원 전 필수 확인 사항</p>
          {checkTexts.map((text, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={checkedList[i]}
                onChange={() => handleCheck(i)}
                className="mt-1 w-4 h-4 accent-[#5D5FEF] shrink-0" 
              />
              <span className={`text-[11px] font-bold transition-colors leading-tight ${
                checkedList[i] ? "text-gray-800" : "text-gray-400"
              }`}>
                {text}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-4 rounded-xl font-black text-gray-400">취소하기</button>
          <button 
            onClick={handleConfirmClick}
            className={`flex-1 py-4 rounded-xl font-black text-white transition-all ${
              checkedList.every(Boolean) ? "bg-[#5D5FEF] hover:bg-[#4A4BCF]" : "bg-blue-300"
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