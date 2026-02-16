// components/income/IncomeSummary.tsx
interface IncomeSummaryProps {
  expectedIncome: number;
  currentMonthIncome: number;
  monthOverMonthGrowth: number;
}

const IncomeSummary = ({
  expectedIncome,
  currentMonthIncome: _currentMonthIncome,
  monthOverMonthGrowth: _monthOverMonthGrowth,
}: IncomeSummaryProps) => {
  return (
    <div className="bg-blue-950/25 rounded-[35px] overflow-hidden p-6 h-96 flex flex-col">
      <h2 className="text-white text-2xl font-semibold font-['Pretendard'] mb-4">
        예상 수입
      </h2>
      <div className="flex-1 flex flex-col justify-end items-end">
        <p className="text-zinc-300 text-base font-normal font-['Pretendard'] mb-1">
          근무 일정 기준
        </p>
        <div className="inline-flex items-center gap-3">
          <span className="text-white text-5xl font-semibold font-['Pretendard']">
            {expectedIncome.toLocaleString()}
          </span>
          <span className="text-white text-3xl font-medium font-['Pretendard']">원</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeSummary;
