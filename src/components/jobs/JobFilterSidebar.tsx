interface Props {
  states: any;
  setters: any;
  actions: any;
  filterDistance: string;
  setFilterDistance: (d: string) => void;
  onKeywordChange: (val: string) => void;
}

const JobFilterSidebar = ({ states, setters, actions, filterDistance, setFilterDistance, onKeywordChange }: Props) => (
  <aside className="w-80 bg-white p-8 rounded-[35px] shadow-sm space-y-6 border border-white relative">

    <div className="relative">
      <input 
        type="text" placeholder="가게명 검색" 
        className="w-full bg-gray-50 rounded-xl p-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-yellow-400"
        value={states.searchKeyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
      {states.isSearching && states.searchResults.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl mt-2 shadow-2xl max-h-48 overflow-y-auto">
          {states.searchResults.map((res: any, i: number) => (
            <div 
              key={i} 
              onClick={() => { actions.handleSelectPlace(res); setters.setSearchKeyword(res.place_name); }} 
              className="p-4 text-xs font-bold hover:bg-yellow-50 cursor-pointer border-b last:border-0"
            >
              <p className="text-gray-800">{res.place_name}</p>
              <p className="text-gray-400 text-[10px] font-medium">{res.address_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-gray-700 w-12">거리</span>
        <div className="flex gap-2 flex-1">
          {["1km", "5km"].map(d => (
            <button 
              key={d} 
              onClick={() => setFilterDistance(d)} 
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all 
                ${filterDistance === d ? "bg-white border-yellow-400 shadow-sm" : "bg-gray-50 border-transparent text-gray-400"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-black text-gray-700">날짜</label>
        <input 
          type="date" value={states.date} 
          onChange={(e) => setters.setDate(e.target.value)} 
          className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border-none outline-none" 
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-black text-gray-700">시작 시간</label>
          <input type="time" value={states.startTime} onChange={(e) => setters.setStartTime(e.target.value)} className="w-full px-3 py-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none" />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-black text-gray-700">종료 시간</label>
          <input type="time" value={states.endTime} onChange={(e) => setters.setEndTime(e.target.value)} className="w-full px-3 py-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-black text-gray-700">시급</label>
        <div className="relative flex items-center">
          <input 
            type="number" value={states.pay} 
            onChange={(e) => setters.setPay(Number(e.target.value))} 
            className="w-full bg-gray-50 p-4 rounded-xl text-sm font-bold text-center border-none outline-none focus:ring-2 focus:ring-yellow-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
          />
          <span className="absolute right-5 text-xs font-black text-gray-400 pointer-events-none">원</span>
        </div>
      </div>
    </div>
  </aside>
);

export default JobFilterSidebar;