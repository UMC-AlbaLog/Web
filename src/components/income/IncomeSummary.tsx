// components/income/IncomeSummary.tsx
const IncomeSummary = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-2">11월 예상 수입 / 실제 수입</h2>

      <p className="text-sm text-gray-500">예상: 620,000원</p>
      <p className="text-xl font-bold">실제: 480,000원</p>

      <div className="mt-4 h-2 bg-gray-200 rounded">
        <div className="h-2 bg-gray-700 rounded w-[77%]" />
      </div>

      <p className="text-xs text-gray-500 mt-2">▲ 지난달 대비 5% 증가</p>
    </div>
  );
};

export default IncomeSummary;
