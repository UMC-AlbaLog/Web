import React, { useEffect } from "react";
import { useWorkForm } from "../../hooks/useWorkForm";

export interface AddWorkRequest {
  workplace: string;
  workDate: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  memo: string;
}

interface AddWorkModalProps {
  onAdd: (data: AddWorkRequest) => Promise<boolean>;
  onClose: () => void;
}

const AddWorkModal: React.FC<AddWorkModalProps> = ({ onAdd, onClose }) => {
  const { states, setters, actions } = useWorkForm();

  useEffect(() => {
    if (!states.searchKeyword.trim()) return;

    const timer = setTimeout(() => {
      actions.handleSearch(states.searchKeyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [states.searchKeyword]);

  const handleSubmit = async () => {
    if (!states.name) return alert("근무지를 선택해주세요!");
    
    const success = await onAdd({
      workplace: states.name,
      workDate: states.date,
      startTime: states.startTime,
      endTime: states.endTime,
      hourlyWage: states.pay,
      memo: states.memo
    });
    
    if (success) onClose();
  };

  const labelStyle = "text-sm font-bold text-gray-500 block mb-1.5";
  const inputStyle = "w-full px-3 py-2.5 bg-white rounded-xl border border-gray-300 text-sm font-bold outline-none focus:border-[#5D5FEF] transition-all text-gray-800 placeholder-gray-400";

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-110 backdrop-blur-sm font-['Pretendard']">
      <div className="bg-white rounded-4xl w-150 p-9 shadow-2xl relative flex flex-col">
        <button onClick={onClose} className="absolute right-8 top-8 text-2xl text-gray-400 hover:text-black">&times;</button>
        <h2 className="text-xl font-black mb-6 text-gray-900 text-left">알바 일정 추가</h2>
        <div className="space-y-5">
          <div className="relative">
            <label className={labelStyle}>근무지</label>
            <input 
              type="text" 
              placeholder="가게 이름을 입력하세요"
              value={states.searchKeyword} 
              onChange={(e) => setters.setSearchKeyword(e.target.value)} 
              className={inputStyle}
            />
            {states.isSearching && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-40 overflow-y-auto">
                {states.searchResults.map((place: any, i: number) => (
                  <div key={i} onClick={() => actions.handleSelectPlace(place)} className="p-3 hover:bg-[#F2F3FF] cursor-pointer border-b border-gray-50 last:border-0 text-left transition-colors">
                    <p className="text-sm font-bold text-gray-800">{place.placeName}</p>
                    <p className="text-[10px] text-gray-400">{place.addressName}</p>
                  </div>
                ))}
              </div>
            )}
            {states.name && <div className="mt-2 p-2.5 bg-[#F8F9FD] rounded-xl border border-gray-100 text-left font-bold text-xs text-[#5D5FEF]">
              {states.name} ({states.category})
            </div>}
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="text-left">
              <label className={labelStyle}>날짜</label>
              <input type="date" 
                     value={states.date} 
                     onChange={(e) => setters.setDate(e.target.value)} 
                     className={inputStyle}
               />
            </div>
            <div className="text-left">
              <label className={labelStyle}>시간</label>
              <div className="flex items-center justify-around bg-white rounded-xl border border-gray-300 px-1.5 h-10.5">
                <div className="flex items-center gap-0.5 flex-1">
                  <input type="time" 
                         value={states.startTime} 
                         onChange={(e) => setters.setStartTime(e.target.value)} 
                         className="w-full outline-none border-none text-sm font-bold bg-transparent text-center p-0"
                   />
                </div>
                <span className="text-gray-400 font-bold mx-0.5 text-xs">→</span>
                <div className="flex items-center gap-0.5 flex-1">
                  <input type="time" 
                         value={states.endTime} 
                         onChange={(e) => setters.setEndTime(e.target.value)} 
                         className="w-full outline-none border-none text-sm font-bold bg-transparent text-center p-0"
                   />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="text-left">
              <label className={labelStyle}>시급</label>
              <div className="relative flex items-center">
                <input type="number" 
                       value={states.pay} 
                       onChange={(e) => setters.setPay(Number(e.target.value))} 
                       className={`${inputStyle} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                 />
                <span className="absolute right-3 text-sm font-bold text-gray-800">원</span>
              </div>
            </div>
            <div className="text-left">
              <label className={labelStyle}>예상 금액</label>
              <div className="w-full px-4 py-2.5 bg-[#F2F3FF] rounded-xl text-sm font-bold text-[#5D5FEF] flex items-center justify-between h-10.5">
                <span>{(states.totalPay || 0).toLocaleString()}</span>
                <span>원</span>
              </div>
            </div>
          </div>
          <div className="text-left">
            <label className={labelStyle}>메모</label>
            <textarea value={states.memo} 
                      onChange={(e) => setters.setMemo(e.target.value)} 
                      placeholder="예) 휴게 30분 포함, 대타 근무" 
                      className={`${inputStyle} h-16 resize-none py-2`}
             />
          </div>
        </div>
        <button onClick={handleSubmit} className="w-full bg-[#5D5FEF] text-white py-4 rounded-2xl font-black text-lg mt-7 hover:bg-[#4A4BCF] shadow-lg transition-all active:scale-95">일정 추가하기</button>
      </div>
    </div>
  );
};

export default AddWorkModal;