import React, { useState, useEffect } from "react";
import CalendarModal from "../CalendarModal";

interface Props {
  states: any; setters: any; actions: any;
}

const JobFilterSidebar: React.FC<Props> = ({ states, setters, actions }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!states.searchKeyword.trim()) return;
    const timer = setTimeout(() => {
      actions.handleSearch(states.searchKeyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [states.searchKeyword, actions]);

  const rowStyle = "flex items-center justify-between relative";
  const labelStyle = "text-[#8E97A4] text-[15px] font-bold shrink-0";
  const inputStyle = "w-[210px] ml-auto h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[15px] font-bold text-gray-800 outline-none focus:border-[#5D5FEF] transition-all text-center";
  const newLocal = "w-[340px] bg-white p-7 rounded-xl border border-gray-100 shadow-sm space-y-6 text-left relative z-50";
  
  return (
    <aside className={newLocal}>

      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" placeholder="검색창" 
          className="text-[17px] font-black outline-none w-full text-gray-800"
          value={states.searchKeyword}
          onChange={(e) => { 
            setters.setSearchKeyword(e.target.value);
          }}
        />
      </div>

      <div className="space-y-5">
        <div className={rowStyle}>
          <span className={labelStyle}>거리</span>
          <div className="flex bg-[#F3F4F6] p-1 rounded-lg ml-auto">
            {[1, 5].map(d => (
              <button 
                key={d} 
                onClick={() => {
                  setters.setDistance(d);
                  setters.setIsDistanceActive(true);
                }} 
                className={`px-5 py-1.5 rounded-md text-[13px] font-bold transition-all ${states.distance === d ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>{d}km</button>
            ))}
          </div>
        </div>

        <div className={rowStyle}>
          <span className={labelStyle}>날짜</span>
          <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className={inputStyle}>{states.date}</button>
          <CalendarModal 
            isOpen={isCalendarOpen} 
            onClose={() => setIsCalendarOpen(false)} 
            selectedDate={states.date} 
            onSelectDate={(date) => { 
              setters.setDate(date); 
              setters.setIsDistanceActive(false);
              setters.setSearchKeyword("");
              setIsCalendarOpen(false);
            }} 
          />
        </div>

        {["업종", "가게명"].map((label) => (
          <div key={label} className={rowStyle}>
            <span className={labelStyle}>{label}</span>
            <input 
              type="text" className={`${inputStyle} ${label === "업종" ? "bg-gray-50" : ""}`}
              value={label === "업종" ? states.category : states.name}
              readOnly={label === "업종"}
              onChange={(e) => label === "가게명" && setters.setName(e.target.value)}
            />
          </div>
        ))}

        <div className={rowStyle}>
          <span className={labelStyle}>시간</span>
          <div className={`${inputStyle} flex items-center justify-center gap-1`}>
            <input type="text" className="w-12 text-center bg-transparent outline-none" value={states.startTime} onChange={(e) => setters.setStartTime(e.target.value)} />
            <span className="text-gray-300">-</span>
            <input type="text" className="w-12 text-center bg-transparent outline-none" value={states.endTime} onChange={(e) => setters.setEndTime(e.target.value)} />
          </div>
        </div>

        <div className={rowStyle}>
          <span className={labelStyle}>시급</span>
          <div className="relative ml-auto">
            <input 
              type="text" className={`${inputStyle} text-right pr-10`}
              value={states.pay.toLocaleString()}
              onChange={(e) => setters.setPay(Number(e.target.value.replace(/[^0-9]/g, "")))}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-800">원</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default JobFilterSidebar;