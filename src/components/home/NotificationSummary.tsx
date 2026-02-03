import React from "react";
import type { Work } from "../../types/work";

const NotificationSummary: React.FC<{ workList: Work[] }> = ({ workList }) => {
  const doneCount = workList.filter(w => w.status === 'done').length;
  const upcomingCount = workList.filter(w => w.status === 'upcoming').length;
  const settlementPendingCount = workList.filter(w => w.settlementStatus === 'pending').length;

  return (
    <div className="bg-white p-8 rounded-[35px] shadow-sm border border-white text-left font-['Pretendard']">
      <h3 className="font-black text-gray-800 mb-6">알림 요약</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-600">근무 완료</span><span className="text-sm font-black text-gray-400">{doneCount}건</span></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-600">출근 예정</span><span className="text-sm font-black text-[#5D5FEF]">{upcomingCount}건</span></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-600">정산 대기</span><span className="text-sm font-black text-gray-400">{settlementPendingCount}건</span></div>
      </div>
    </div>
  );
};

export default NotificationSummary;