import React from "react";
import { useWorkForm } from "../../hooks/useWorkForm";
import type { Work } from "../../types/work";

interface AddWorkModalProps {
  onAdd: (newWork: Omit<Work, "id" | "status">) => void;
  onClose: () => void;
}

const AddWorkModal: React.FC<AddWorkModalProps> = ({ onAdd, onClose }) => {
  const { states, setters, actions } = useWorkForm();

  const handleSubmit = () => {
    if (!states.name) return alert("근무지를 선택해주세요!");
    onAdd({
      name: states.name,
      address: states.address,
      time: `${states.startTime} ~ ${states.endTime}`,
      duration: states.duration,
      pay: states.pay,
      expectedPay: states.totalPay,
      date: states.date,
      memo: states.memo,
      startTime: "",
      endTime: "",
      description: "",
      requirements: "",
      notice: ""
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-110 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] w-120 p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute right-8 top-8 text-2xl text-gray-400 hover:text-black">&times;</button>
        <h2 className="text-xl font-extrabold mb-8 text-gray-800">새 알바 일정 추가</h2>
        <div className="space-y-6 overflow-y-auto flex-1 scrollbar-hide">

          <div className="relative">
            <label className="text-sm font-bold block mb-2 text-gray-700">1. 근무지 검색</label>
            <div className="flex gap-2">
              <input type="text" 
                     placeholder="가게 이름을 입력하세요"
                     value={states.searchKeyword}
                     onChange={(e) => setters.setSearchKeyword(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && actions.handleSearch(states.searchKeyword)}
                     className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm border-2 border-transparent focus:border-yellow-400 outline-none transition-all"
               />
              <button onClick={() => actions.handleSearch(states.searchKeyword)} className="bg-gray-800 text-white px-5 rounded-xl text-xs font-bold hover:bg-black transition-colors">검색</button>
            </div>
            {states.isSearching && (
              <div className="absolute z-20 w-full bg-white border border-gray-100 rounded-2xl mt-2 shadow-2xl max-h-52 overflow-y-auto">
                {states.searchResults.length > 0 ? (
                  <ul>{states.searchResults.map((place, i) => (
                    <li key={i}
                        onClick={() => actions.handleSelectPlace(place)}
                        className="p-4 hover:bg-yellow-50 cursor-pointer border-b last:border-0 transition-colors">
                          <p className="text-sm font-bold text-gray-800">{place.place_name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{place.address_name}</p>
                    </li>))}
                  </ul>
                ) : states.hasSearched && (<div className="p-8 text-center text-sm text-gray-500">검색 결과가 없습니다 😢</div>)}
              </div>
            )}
          </div>
          {states.name && (
            <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100"><p className="text-[10px] text-yellow-600 font-bold mb-1">선택된 장소</p><p className="text-sm font-bold text-gray-800">{states.name}</p><p className="text-[10px] text-gray-500">{states.address}</p></div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div><label className="text-sm font-bold block mb-2 text-gray-700">2. 날짜 선택</label><input type="date" value={states.date} onChange={(e) => setters.setDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none" /></div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-bold block mb-2 text-gray-700">시작 시간</label>
                <input type="time" value={states.startTime} onChange={(e) => setters.setStartTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-bold block mb-2 text-gray-700">종료 시간</label>
                <input type="time" value={states.endTime} onChange={(e) => setters.setEndTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2 text-gray-700">3. 시급 입력</label>
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1 font-bold">
                <input type="number" value={states.pay} onChange={(e) => setters.setPay(Number(e.target.value))} className="bg-transparent w-20 outline-none" /><span>원</span>
              </div>
              <span className="text-xs text-yellow-600 font-extrabold italic">
                예상 {(states.totalPay || 0).toLocaleString()}원
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold block mb-2 text-gray-700">4. 메모</label>
            <textarea value={states.memo} onChange={(e) => setters.setMemo(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm h-20 resize-none outline-none focus:border-yellow-400" />
          </div>
        </div>
        <button onClick={handleSubmit} className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-extrabold mt-8 hover:bg-yellow-500 shadow-lg">
          일정 추가하기
        </button>
      </div>
    </div>
  );
};

export default AddWorkModal;