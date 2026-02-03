import React from "react";
import { useWorkForm } from "../../hooks/useWorkForm";
import { COMMON_STYLES } from "../../constants/styles";
import type { Work } from "../../types/work";

interface AddWorkModalProps {
  onAdd: (newWork: Omit<Work, "id" | "status"> & { category?: string }) => void;
  onClose: () => void;
}

const AddWorkModal: React.FC<AddWorkModalProps> = ({ onAdd, onClose }) => {
  const { states, setters, actions } = useWorkForm();

  const handleSubmit = () => {
    if (!states.name) return alert("근무지를 선택해주세요!");
    onAdd({
      name: states.name,
      address: states.address,
      category: states.category,
      time: `${states.startTime} ~ ${states.endTime}`,
      duration: states.duration,
      pay: states.pay,
      expectedPay: states.totalPay,
      date: states.date,
      memo: states.memo,
      description: "",
      requirements: "",
      notice: ""
    });
    onClose();
  };

  return (
    <div className={COMMON_STYLES.MODAL_OVERLAY}>
      <div className={COMMON_STYLES.MODAL_CONTAINER}>
        <button onClick={onClose} className="absolute right-8 top-8 text-2xl text-gray-400 hover:text-black">&times;</button>
        <h2 className="text-xl font-black mb-6 text-gray-900 text-left">알바 일정 추가</h2>
        
        <div className="space-y-5">
          <div className="relative">
            <label className={COMMON_STYLES.LABEL}>근무지</label>
            <input 
              type="text" 
              placeholder="가게 이름을 입력하세요" 
              value={states.searchKeyword}
              onChange={(e) => { setters.setSearchKeyword(e.target.value); actions.handleSearch(e.target.value); }}
              className={COMMON_STYLES.INPUT}
            />
            {states.isSearching && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-40 overflow-y-auto">
                {states.searchResults.map((place: any, i: number) => (
                  <div key={i} onClick={() => actions.handleSelectPlace(place)} className="p-3 hover:bg-[#F2F3FF] cursor-pointer border-b border-gray-50 last:border-0 text-left">
                    <p className="text-sm font-bold text-gray-800">{place.place_name}</p>
                    <p className="text-[10px] text-gray-400">{place.address_name}</p>
                  </div>
                ))}
              </div>
            )}
            {states.name && (
              <div className="mt-2 p-2.5 bg-[#F8F9FD] rounded-xl border border-gray-100 text-left">
                <p className="text-xs font-bold text-[#5D5FEF]">{states.name} <span className="text-gray-400 ml-1">({states.category})</span></p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="text-left">
              <label className={COMMON_STYLES.LABEL}>날짜</label>
              <input type="date" value={states.date} onChange={(e) => setters.setDate(e.target.value)} className={COMMON_STYLES.INPUT} />
            </div>
            <div className="text-left">
              <label className={COMMON_STYLES.LABEL}>시간</label>
              <div className="flex items-center justify-around bg-white rounded-xl border border-gray-300 px-1.5 h-10.5">
                <div className="flex items-center gap-0.5 flex-1">
                  <input type="time" value={states.startTime} onChange={(e) => setters.setStartTime(e.target.value)} className="w-full outline-none border-none text-sm font-bold bg-transparent text-center p-0" />
                </div>
                <span className="text-gray-400 font-bold shrink-0 mx-0.5 text-xs">→</span>
                <div className="flex items-center gap-0.5 flex-1">
                  <input type="time" value={states.endTime} onChange={(e) => setters.setEndTime(e.target.value)} className="w-full outline-none border-none text-sm font-bold bg-transparent text-center p-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="text-left">
              <label className={COMMON_STYLES.LABEL}>시급</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  value={states.pay} 
                  onChange={(e) => setters.setPay(Number(e.target.value))} 
                  className={`${COMMON_STYLES.INPUT} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} 
                />
                <span className="absolute right-3 text-sm font-bold text-gray-800">원</span>
              </div>
            </div>
            <div className="text-left">
              <label className={COMMON_STYLES.LABEL}>예상 금액</label>
              <div className="w-full px-4 py-2.5 bg-[#F2F3FF] rounded-xl border border-transparent text-sm font-bold text-[#5D5FEF] flex items-center justify-between h-10.5">
                <span>{(states.totalPay || 0).toLocaleString()}</span>
                <span>원</span>
              </div>
            </div>
          </div>

          <div className="text-left">
            <label className={COMMON_STYLES.LABEL}>메모</label>
            <textarea 
              value={states.memo} 
              onChange={(e) => setters.setMemo(e.target.value)} 
              placeholder="예) 휴게 30분 포함, 대타 근무"
              className={`${COMMON_STYLES.INPUT} h-16 resize-none py-2`}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          className="w-full bg-[#5D5FEF] text-white py-4 rounded-2xl font-black text-lg mt-7 hover:bg-[#4A4BCF] shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          일정 추가하기
        </button>
      </div>
    </div>
  );
};

export default AddWorkModal;