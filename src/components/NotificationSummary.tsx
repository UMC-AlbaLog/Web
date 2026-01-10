import React from "react";
import type { Work } from "../types/work";

interface NotificationSummaryProps {
  workList: Work[];
}

const NotificationSummary: React.FC<NotificationSummaryProps> = ({ workList }) => {
  const workingCount = workList.filter(w => w.status === 'working').length;
  const upcomingCount = workList.filter(w => w.status === 'upcoming').length;

  return (
    <div className="bg-white p-8 rounded-[35px] shadow-sm border border-white">
      <h3 className="font-bold mb-4">
        알림 요약
      </h3>
      
      <div className="space-y-6 text-left">
        <p className="text-sm font-bold text-gray-800">
          출근 한 알바 
          <span className="ml-4 text-[#5D5FEF]">{workingCount}건</span>
        </p>

        <p className="text-sm font-bold text-gray-800">
          출근 예정 
          <span className="ml-4 text-yellow-500">{upcomingCount}건</span>
        </p>

        <p className="text-sm font-bold text-gray-700 opacity-50">
          정산 대기 2건입니다
        </p>
      </div>
    </div>
  );
};

export default NotificationSummary;