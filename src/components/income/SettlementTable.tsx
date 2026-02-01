// components/income/SettlementTable.tsx
import { useState } from "react";
import type { SettlementStatus } from "../../types/work";
import type { IncomeWorkItem } from "../../hooks/useIncome";

type FilterStatus = "all" | "pending" | "completed" | "unsettled";

interface SettlementTableProps {
  completedWorks: IncomeWorkItem[];
  updateSettlementStatus?: (workId: string, status: SettlementStatus, actualPay?: number) => void;
  /** 제목 뒤에 붙일 텍스트 (예: " (2025년 12월)") */
  titleSuffix?: string;
}

const SettlementTable = ({ completedWorks, titleSuffix }: SettlementTableProps) => {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate().toString().padStart(2, "0")}`;
  };

  const getStatusText = (status?: SettlementStatus) => {
    switch (status) {
      case "completed":
        return "정산 완료";
      case "pending":
        return "정산 대기";
      default:
        return "미정산";
    }
  };

  const filteredWorks = completedWorks
    .filter((work) => {
      if (filter === "all") return true;
      if (filter === "unsettled") return !work.settlementStatus;
      return work.settlementStatus === filter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "pending", label: "정산 대기" },
    { key: "completed", label: "정산 완료" },
    { key: "unsettled", label: "미정산" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-gray-900 text-4xl font-bold font-['Pretendard']">
        {titleSuffix ? `근무 내역${titleSuffix}` : "오늘의 근무"}
      </h2>

      {/* 필터 탭: 전체 / 정산 대기 / 정산 완료 / 미정산 - 선택값에 맞게 필터링 */}
      <div className="h-16 bg-neutral-100 rounded-[20px] inline-flex w-full">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`flex-1 h-full p-2.5 rounded-[20px] flex justify-center items-center gap-2.5 transition-colors ${
              filter === tab.key
                ? "bg-white outline outline-[1.5px] outline-offset-[-1.5px] outline-indigo-600 text-indigo-600 text-2xl font-semibold font-['Pretendard']"
                : "text-zinc-600 text-2xl font-normal font-['Pretendard'] hover:bg-neutral-200/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="flex flex-col gap-0 overflow-hidden rounded-b-[20px] border border-t-0 border-zinc-200">
        <div className="inline-flex w-full">
          <div className="flex-1 px-6 py-4 bg-slate-100 rounded-tl-[20px] border-b-[1.5px] border-zinc-400 flex justify-center items-center">
            <span className="text-center text-black text-2xl font-medium font-['Pretendard']">
              근무일자
            </span>
          </div>
          <div className="flex-1 px-6 py-4 bg-slate-100 border-b-[1.5px] border-zinc-400 flex justify-center items-center">
            <span className="text-center text-black text-2xl font-medium font-['Pretendard']">
              매장 명
            </span>
          </div>
          <div className="flex-1 px-6 py-4 bg-slate-100 border-b-[1.5px] border-zinc-400 flex justify-center items-center">
            <span className="text-center text-black text-2xl font-medium font-['Pretendard']">
              근무 시간
            </span>
          </div>
          <div className="flex-1 px-6 py-4 bg-slate-100 border-b-[1.5px] border-zinc-400 flex justify-center items-center">
            <span className="text-center text-black text-2xl font-medium font-['Pretendard']">
              예상 수입
            </span>
          </div>
          <div className="flex-1 px-6 py-4 bg-slate-100 border-b-[1.5px] border-zinc-400 flex justify-center items-center">
            <span className="text-center text-black text-2xl font-medium font-['Pretendard']">
              실제 수입
            </span>
          </div>
          <div className="flex-1 px-6 py-4 bg-slate-100 rounded-tr-[20px] border-b-[1.5px] border-zinc-400 flex justify-center items-center">
            <span className="text-center text-black text-2xl font-medium font-['Pretendard']">
              정산 상태
            </span>
          </div>
        </div>

        {filteredWorks.length === 0 ? (
          <div className="py-12 bg-white text-center text-zinc-500 text-xl font-['Pretendard']">
            해당 상태의 작업이 없습니다
          </div>
        ) : (
          filteredWorks.map((work) => (
            <div
              key={work.id}
              className="inline-flex w-full border-b border-zinc-200 last:border-b-0"
            >
              <div className="flex-1 px-6 py-4 bg-white flex justify-center items-center">
                <span className="text-center text-black text-2xl font-normal font-['Pretendard']">
                  {formatDate(work.date)}
                </span>
              </div>
              <div className="flex-1 px-6 py-4 bg-white flex justify-center items-center">
                <span className="text-center text-black text-2xl font-normal font-['Pretendard']">
                  {work.name}
                </span>
              </div>
              <div className="flex-1 px-6 py-4 bg-white flex justify-center items-center">
                <span className="text-center text-black text-2xl font-normal font-['Pretendard']">
                  {work.duration}시간
                </span>
              </div>
              <div className="flex-1 px-6 py-4 bg-white flex justify-center items-center">
                <span className="text-center text-black text-2xl font-normal font-['Pretendard']">
                  {work.expectedPay.toLocaleString()}원
                </span>
              </div>
              <div className="flex-1 px-6 py-4 bg-white flex justify-center items-center">
                <span className="text-center text-black text-2xl font-medium font-['Pretendard']">
                  {(work.actualPay ?? work.expectedPay).toLocaleString()}원
                </span>
              </div>
              <div className="flex-1 px-6 py-4 bg-white flex justify-center items-center">
                <span
                  className={`px-4 py-2 rounded-[110px] text-xl font-semibold font-['Pretendard'] ${
                    work.settlementStatus === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : work.settlementStatus === "pending"
                        ? "bg-slate-100 text-indigo-600"
                        : "bg-slate-100 text-zinc-500"
                  }`}
                >
                  {getStatusText(work.settlementStatus)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SettlementTable;
