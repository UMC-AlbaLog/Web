interface Props {
  states: any; setters: any; actions: any;
  filterDistance: string; setFilterDistance: (d: string) => void;
}

const JobFilterSidebar = ({ states, setters, actions, filterDistance, setFilterDistance }: Props) => (
  <aside className="w-85 bg-white p-8 rounded-[35px] shadow-sm space-y-6 border border-white relative">
    <div className="relative">
      <input 
        type="text" placeholder="가게명 검색" 
        className="w-full bg-gray-50 rounded-xl p-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-yellow-400"
        value={states.searchKeyword}
        onChange={(e) => { setters.setSearchKeyword(e.target.value); actions.handleSearch(e.target.value); }}
      />
      {states.isSearching && (
        <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl mt-2 shadow-2xl max-h-48 overflow-y-auto">
          {states.searchResults.map((res: any, i: number) => (
            <div key={i} onClick={() => actions.handleSelectPlace(res)} className="p-4 text-xs font-bold hover:bg-yellow-50 cursor-pointer border-b last:border-0">
              <p className="text-gray-800">{res.place_name}</p>
              <p className="text-gray-400 text-[10px]">{res.address_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-gray-700 w-12 text-left">거리</span>
        <div className="flex gap-2 flex-1">
          {["1km", "5km"].map(d => (
            <button key={d} onClick={() => setFilterDistance(d)} className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${filterDistance === d ? "bg-white border-yellow-400 shadow-sm" : "bg-gray-50 border-transparent text-gray-400"}`}>{d}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-gray-700 w-12 text-left">날짜</span>
        <input type="date" value={states.date} onChange={(e) => setters.setDate(e.target.value)} className="flex-1 bg-gray-50 p-3 rounded-xl text-xs font-bold text-center border-none" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-gray-700 w-12 text-left">업종</span>
        <div className="flex-1 bg-gray-50 p-3 rounded-xl text-xs font-bold text-center text-gray-800 min-h-10">
          {states.category || "선택 전"}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-gray-700 w-12 text-left">가게명</span>
        <div className="flex-1 bg-gray-50 p-3 rounded-xl text-xs font-bold text-center text-gray-800 min-h-10">
          {states.name || "선택 전"}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-gray-700 w-12 text-left">시간</span>
        <div className="flex gap-1 flex-1">
          <input type="time" value={states.startTime} onChange={(e) => setters.setStartTime(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl text-[10px] font-bold text-center border-none" />
          <span className="text-gray-300 self-center">-</span>
          <input type="time" value={states.endTime} onChange={(e) => setters.setEndTime(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl text-[10px] font-bold text-center border-none" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-gray-700 w-12 text-left">시급</span>
        <div className="relative flex-1 flex items-center">
          <input type="number" value={states.pay} onChange={(e) => setters.setPay(Number(e.target.value))} className="w-full bg-gray-50 p-3 rounded-xl text-xs font-bold text-center border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <span className="absolute right-4 text-[10px] font-black text-gray-400">원</span>
        </div>
      </div>
    </div>
  </aside>
);

export default JobFilterSidebar;