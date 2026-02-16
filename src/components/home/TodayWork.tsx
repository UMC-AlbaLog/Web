import React from "react";

const TodayWork: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-[40px] p-12 text-center shadow-sm flex-1 flex flex-col justify-center items-center h-full font-['Pretendard']">
      <div className="text-7xl font-black mb-6 text-gray-200">!</div>
      <p className="text-2xl font-extrabold text-gray-800 mb-2">
        아직 등록된 알바 일정이 없어요
      </p>
      <p className="text-gray-400 font-bold">
        알바 일정을 추가해주세요
      </p>
    </div>
  );
};

export default TodayWork;