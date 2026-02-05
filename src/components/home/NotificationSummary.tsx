import React from "react";

interface NotificationSummaryProps {
  summary: {
    completed: number;
    scheduled: number;
    pending: number;
  };
}

const NotificationSummary: React.FC<NotificationSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white p-8 rounded-[35px] shadow-sm border border-white text-left font-['Pretendard']">
      <h3 className="font-black text-gray-800 mb-6">알림 요약</h3>
      <div className="space-y-4">

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-600">근무 완료</span>
          <span className="text-sm font-black text-gray-400">{summary.completed}건</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-600">출근 예정</span>
          <span className="text-sm font-black text-[#5D5FEF]">{summary.scheduled}건</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-600">정산 대기</span>
          <span className="text-sm font-black text-gray-400">{summary.pending}건</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationSummary;