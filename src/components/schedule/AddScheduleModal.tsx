import React, { useState, useMemo, useCallback } from "react";
import type { ScheduleItem, Workplace } from "../../types/schedule";
import { calculateDuration } from "../../utils/scheduleUtils";
import AddWorkplaceModal from "./AddWorkplaceModal";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const DAY_INDICES = [1, 2, 3, 4, 5, 6, 0];

interface AddScheduleModalProps {
  workplaces: Workplace[];
  onSave: (schedule: ScheduleItem) => void;
  onClose: () => void;
  onAddWorkplace: (workplace: Workplace) => void;
}

const AddScheduleModal = ({
  workplaces,
  onSave,
  onClose,
  onAddWorkplace,
}: AddScheduleModalProps) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("18:00");
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly" | "biweekly">("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [hourlyWage, setHourlyWage] = useState("");
  const [memo, setMemo] = useState("");
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);

  const hours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    return Math.max(0, calculateDuration(startTime, endTime));
  }, [startTime, endTime]);

  const estimatedSalary = useMemo(() => {
    return Math.round((Number(hourlyWage.replace(/,/g, "")) || 0) * hours);
  }, [hourlyWage, hours]);

  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays((prev: number[]) =>
      prev.includes(dayIndex) ? prev.filter((d: number) => d !== dayIndex) : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const handleWageChange = (value: string) => {
    const num = value.replace(/,/g, "").replace(/[^0-9]/g, "");
    setHourlyWage(num ? Number(num).toLocaleString() : "");
  };

  const handleSubmit = () => {
    if (!selectedWorkplace || !date || !startTime || !endTime) {
      alert("근무지, 날짜, 시간을 입력해주세요.");
      return;
    }
    const wp = workplaces.find((w) => w.id === selectedWorkplace);
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      workplaceId: selectedWorkplace,
      date,
      startTime,
      endTime,
      scheduleName: wp?.name ?? "일정",
      scheduleType: "work",
      salaryType: "hourly",
      hourlyWage: Number(hourlyWage.replace(/,/g, "")) || undefined,
      memo: memo || undefined,
      repeatType,
      repeatDays: repeatType !== "none" ? repeatDays : undefined,
    };
    onSave(newSchedule);
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if ((e.target as HTMLElement).getAttribute("data-modal-backdrop") === "true") {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      data-modal-backdrop="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="flex w-[797px] max-w-[95vw] flex-col items-start overflow-hidden rounded-xl bg-white p-8 shadow-lg"
        style={{
          maxHeight: "80vh",
          height: "80vh",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-schedule-title"
        data-modal-version="2025-02"
      >
        {/* 헤더 - 닫기 버튼 항상 보이게 */}
        <div className="flex shrink-0 items-center justify-between self-stretch border-b border-gray-100 pb-4">
          <h2 id="add-schedule-title" className="text-base font-semibold text-gray-900">
            새 알바 일정 추가
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        </div>

        {/* 스크롤 영역 - 높이 제한으로 내부만 스크롤 */}
        <div
          className="mt-4 flex flex-1 flex-col gap-6 self-stretch overflow-y-auto overflow-x-hidden"
          style={{ minHeight: 0, WebkitOverflowScrolling: "touch" }}
        >
          {/* 1. 근무지 선택 */}
          <div className="self-stretch flex flex-col gap-2">
            <label className="text-gray-700 text-xs font-medium font-['Pretendard']">근무지</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedWorkplace}
                onChange={(e) => setSelectedWorkplace(e.target.value)}
                className="flex-1 min-w-0 h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">선택</option>
                {workplaces.map((wp) => (
                  <option key={wp.id} value={wp.id}>{wp.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowWorkplaceModal(true)}
                className="text-indigo-600 text-xs hover:underline shrink-0"
              >
                + 새 알바 등록하기
              </button>
            </div>
          </div>

          {/* 2. 날짜 · 시간 */}
          <div className="self-stretch flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-4">
            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-48 flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-48 flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">종료 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 3. 반복 설정 */}
          <div className="self-stretch flex flex-col gap-4">
            <div className="inline-flex items-center gap-2">
              <span className="text-indigo-600 text-base" aria-hidden>🔄</span>
              <div className="text-gray-900 text-base font-semibold font-['Pretendard']">반복 설정</div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {(["none", "daily", "weekly", "biweekly"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRepeatType(type)}
                    className={`px-4 py-2 rounded-[20px] text-xs font-medium outline outline-1 outline-offset-[-1px] ${
                      repeatType === type
                        ? "bg-violet-50 text-indigo-600 outline-indigo-600"
                        : "text-gray-500 outline-black/10 hover:bg-slate-50"
                    }`}
                  >
                    {type === "none" ? "없음" : type === "daily" ? "매일" : type === "weekly" ? "매주" : "격주"}
                  </button>
                ))}
              </div>
              {(repeatType === "weekly" || repeatType === "biweekly") && (
                <div className="flex gap-3">
                  {DAY_INDICES.map((dayIndex, i) => (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => toggleRepeatDay(dayIndex)}
                      className={`w-8 h-8 rounded-[20px] flex justify-center items-center text-xs font-medium outline outline-1 outline-offset-[-1px] ${
                        repeatDays.includes(dayIndex)
                          ? "bg-violet-50 text-indigo-600 outline-indigo-600"
                          : "text-gray-500 outline-black/10 hover:bg-slate-50"
                      }`}
                    >
                      {DAY_LABELS[i]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. 시급 · 메모 */}
          <div className="self-stretch flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-4">
            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">시급</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={hourlyWage}
                  onChange={(e) => handleWageChange(e.target.value)}
                  placeholder="0"
                  className="flex-1 min-w-0 h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm text-right focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-600 text-sm">원</span>
                <span className="text-gray-500 text-xs">예상 {estimatedSalary.toLocaleString()}원</span>
              </div>
            </div>
            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">메모</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모를 입력하세요"
                className="w-full h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="shrink-0 self-stretch h-10 flex justify-center items-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
          >
            일정 추가하기
          </button>
        </div>
      </div>

      {showWorkplaceModal && (
        <AddWorkplaceModal
          onSave={(workplace) => {
            onAddWorkplace(workplace);
            setShowWorkplaceModal(false);
            setSelectedWorkplace(workplace.id);
          }}
          onClose={() => setShowWorkplaceModal(false)}
        />
      )}
    </div>
  );
};

export default AddScheduleModal;
