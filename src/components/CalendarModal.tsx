import React, { useState, useMemo } from 'react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, selectedDate, onSelectDate }) => {
  const getTodayKST = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstDiff = 9 * 60 * 60 * 1000;
    const todayKST = new Date(utc + kstDiff);
    return { 
      dateObj: todayKST, 
      dateStr: `${todayKST.getFullYear()}-${String(todayKST.getMonth() + 1).padStart(2, '0')}-${String(todayKST.getDate()).padStart(2, '0')}` 
    };
  };

  const { dateObj: today, dateStr: todayStr } = getTodayKST();
  const initialViewDate = selectedDate ? new Date(selectedDate) : today;
  const [viewDate, setViewDate] = useState(initialViewDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = startPadding - 1; i >= 0; i--) days.push({ day: lastDateOfPrevMonth - i, month: 'prev' });
    for (let i = 1; i <= lastDateOfMonth; i++) days.push({ day: i, month: 'curr' });
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) days.push({ day: i, month: 'next' });
    return days;
  }, [year, month]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full mt-2 right-0 z-200 w-67.5 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 flex flex-col font-['Pretendard']">
      
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-7 h-7 rounded-full hover:bg-gray-50 text-gray-400">{"<"}</button>
        <span className="text-[15px] font-black text-gray-800">{year}년 {month + 1}월</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-7 h-7 rounded-full hover:bg-gray-50 text-gray-400">{">"}</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
          <span key={d} className={`text-center text-[10px] font-bold text-gray-400 mb-2 ${i === 6 ? 'text-red-400' : ''}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 mb-4">
        {calendarDays.map((item, i) => {
          const isSunday = i % 7 === 6;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
          const isSelected = item.month === 'curr' && (selectedDate || todayStr) === dateStr;

          return (
            <div key={i} className="flex justify-center items-center h-7 cursor-pointer" onClick={() => item.month === 'curr' && onSelectDate(dateStr)}>
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold transition-all
                ${isSelected ? 'bg-[#5D5FEF] text-white' : 'hover:bg-gray-50'}
                ${isSunday && !isSelected ? 'text-[#FF4D4D]' : 'text-gray-800'}
                ${item.month !== 'curr' ? 'opacity-20' : ''}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 bg-gray-50 rounded-lg text-[12px] font-bold text-gray-400 hover:bg-gray-100">취소</button>
        <button onClick={onClose} className="flex-1 py-2 bg-[#5D5FEF] rounded-lg text-[12px] font-bold text-white hover:bg-[#4A4BCF]">선택</button>
      </div>
    </div>
  );
};

export default CalendarModal;