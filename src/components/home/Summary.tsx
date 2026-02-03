import React from "react";

const Card: React.FC<{ title: string; value: string; unit: string }> = ({ title, value, unit }) => (
  <div className="bg-white rounded-[30px] p-8 flex-1 shadow-sm border border-white h-36 flex flex-col justify-between">
    <p className="text-gray-500 text-sm font-bold">{title}</p>
    <div className="flex justify-end items-baseline gap-1">
      <h2 className="text-4xl font-black text-[#5D5FEF] tracking-tight">{value}</h2>
      <span className="text-lg font-bold text-gray-800">{unit}</span>
    </div>
  </div>
);

const Summary: React.FC<{ workList: any[] }> = ({ workList }) => {
  const totalCount = workList.length;
  const totalHours = workList.reduce((acc, curr) => acc + Number(curr.duration || 0), 0);
  const totalIncome = workList.reduce((acc, curr) => acc + Number(curr.expectedPay || 0), 0);

  return (
    <div className="flex gap-4">
      <Card title="근무 일정" value={totalCount.toString()} unit="건" />
      <Card title="총 근무 시간" value={totalHours.toString()} unit="시간" />
      <Card title="예상 수입" value={totalIncome.toLocaleString()} unit="원" />
    </div>
  );
};

export default Summary;