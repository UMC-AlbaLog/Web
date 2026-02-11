import { useState, useMemo } from "react";
import type { ScheduleItem, Workplace } from "../../types/schedule";
import { SCHEDULE_COLORS } from "../../types/schedule";
import { calculateDuration } from "../../utils/scheduleUtils";
import AddWorkplaceModal from "./AddWorkplaceModal";

const DAY_LABELS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];

interface ScheduleEditModalProps {
  schedule: ScheduleItem;
  workplaces: Workplace[];
  onSave: (schedule: ScheduleItem) => void;
  onDelete: (scheduleId: string) => void;
  onClose: () => void;
  onAddWorkplace?: (workplace: Workplace) => void;
}

const ScheduleEditModal = ({
  schedule,
  workplaces,
  onSave,
  onDelete,
  onClose,
  onAddWorkplace,
}: ScheduleEditModalProps) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState(schedule.workplaceId);
  const [date, setDate] = useState(schedule.date);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly" | "biweekly">(schedule.repeatType ?? "none");
  const [repeatDays, setRepeatDays] = useState<number[]>(schedule.repeatDays ?? [1, 2, 3, 4, 5]);
  const [hourlyWage, setHourlyWage] = useState(
    schedule.hourlyWage != null ? schedule.hourlyWage.toLocaleString() : ""
  );
  const [memo, setMemo] = useState(schedule.memo ?? "");
  const [color, setColor] = useState(schedule.color ?? "");
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);

  const wp = workplaces.find((w) => w.id === selectedWorkplace);
  const displayColor = color || wp?.color || SCHEDULE_COLORS[0];

  const hours = useMemo(() => {
    return Math.max(0, calculateDuration(startTime, endTime));
  }, [startTime, endTime]);

  const estimatedSalary = useMemo(() => {
    return Math.round((Number(hourlyWage.replace(/,/g, "")) || 0) * hours);
  }, [hourlyWage, hours]);

  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort((a, b) => a - b)
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
    const updatedSchedule: ScheduleItem = {
      ...schedule,
      workplaceId: selectedWorkplace,
      scheduleName: wp?.name ?? schedule.scheduleName,
      date,
      startTime,
      endTime,
      hourlyWage: Number(hourlyWage.replace(/,/g, "")) || undefined,
      memo: memo || undefined,
      repeatType,
      repeatDays: repeatType !== "none" ? repeatDays : undefined,
      color: color || undefined,
    };
    onSave(updatedSchedule);
  };

  const handleDelete = () => {
    if (confirm("이 일정을 삭제하시겠습니까?")) {
      onDelete(schedule.id);
    }
  };

  const colorsForPicker = SCHEDULE_COLORS.slice(0, 6);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-[797px] max-w-[800px] p-8 bg-white rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] inline-flex flex-col justify-start items-start gap-8 max-h-[90vh] overflow-y-auto">
        {/* 일정 상세 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="self-stretch inline-flex justify-start items-center gap-2">
            <span className="text-indigo-600 text-base" aria-hidden>📅</span>
            <h2 className="text-gray-900 text-base font-semibold font-['Inter']">일정 상세</h2>
          </div>
          <div className="self-stretch flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-4">
            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">근무지</label>
              <select
                value={selectedWorkplace}
                onChange={(e) => setSelectedWorkplace(e.target.value)}
                className="w-full h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {workplaces.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {onAddWorkplace && (
                <button
                  type="button"
                  onClick={() => setShowWorkplaceModal(true)}
                  className="text-indigo-600 text-xs hover:underline mt-1"
                >
                  + 새 알바 등록하기
                </button>
              )}
            </div>
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
        </div>

        {/* 라벨 색상 */}
        <div className="self-stretch flex flex-col gap-2">
          <div className="text-gray-500 text-xs font-medium font-['Pretendard']">라벨 색상</div>
          <div className="inline-flex justify-start items-center gap-3">
            {colorsForPicker.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-2xl border-2 transition-transform hover:scale-105 ${
                  displayColor === c ? "border-indigo-600" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`색상 ${c}`}
              />
            ))}
          </div>
        </div>

        {/* 반복 설정 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="inline-flex justify-start items-center gap-2">
            <span className="text-indigo-600 text-base" aria-hidden>🔄</span>
            <div className="text-gray-900 text-base font-semibold font-['Pretendard']">반복 설정</div>
          </div>
          <div className="self-stretch inline-flex justify-start items-start gap-3 flex-wrap">
            {(["none", "daily", "weekly", "biweekly"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setRepeatType(type)}
                className={`px-4 py-2 rounded-[20px] text-xs font-medium font-['Pretendard'] outline outline-1 outline-offset-[-1px] ${
                  repeatType === type
                    ? "bg-violet-50 text-indigo-600 outline-indigo-600"
                    : "text-gray-500 outline-black/10 hover:bg-slate-50"
                }`}
              >
                {type === "none" ? "없음" : type === "daily" ? "매일" : type === "weekly" ? "매주" : "격주"}
              </button>
            ))}
          </div>
          <div className="self-stretch inline-flex justify-start items-start gap-2">
            {DAY_INDICES.map((dayIndex) => (
              <button
                key={dayIndex}
                type="button"
                onClick={() => (repeatType === "weekly" || repeatType === "biweekly") && toggleRepeatDay(dayIndex)}
                className={`w-9 h-9 rounded-2xl flex justify-center items-center text-xs font-normal outline outline-1 outline-offset-[-1px] ${
                  (repeatType === "weekly" || repeatType === "biweekly") && repeatDays.includes(dayIndex)
                    ? "bg-violet-50 text-slate-700 outline-indigo-600"
                    : "outline-black/10 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {DAY_LABELS_SHORT[dayIndex]}
              </button>
            ))}
          </div>
        </div>

        {/* 시급 & 예상 수입 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="inline-flex justify-start items-center gap-2">
            <span className="text-indigo-600 text-base" aria-hidden>💰</span>
            <div className="text-gray-900 text-base font-semibold font-['Pretendard']">시급&amp; 예상 수입</div>
          </div>
          <div className="self-stretch flex flex-col sm:flex-row gap-4 sm:gap-6 flex-wrap">
            <div className="w-96 max-w-full flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">시급</label>
              <input
                type="text"
                inputMode="numeric"
                value={hourlyWage}
                onChange={(e) => handleWageChange(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-4 bg-white rounded-lg border border-black/10 text-black text-sm text-right focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-96 max-w-full flex flex-col gap-2">
              <label className="text-gray-700 text-xs font-medium font-['Pretendard']">총 근무 시간</label>
              <div className="w-full h-10 px-4 bg-gray-100 rounded-lg border border-black/10 flex items-center text-gray-600 text-sm">
                {hours.toFixed(1)}시간
              </div>
            </div>
          </div>
          <div className="self-stretch p-4 bg-slate-50 rounded-lg border border-black/10 inline-flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-normal font-['Inter']">예상 수입</span>
              <span className="text-gray-400 text-xs font-normal font-['Inter']">Wage x Hours</span>
            </div>
            <span className="text-indigo-600 text-lg font-bold font-['Inter']">
              {estimatedSalary.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 메모 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="inline-flex justify-start items-center gap-2">
            <span className="text-indigo-600 text-base" aria-hidden>📝</span>
            <div className="text-gray-900 text-base font-semibold font-['Inter']">메모</div>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            className="self-stretch min-h-24 px-4 py-3 bg-white rounded-lg border border-black/10 text-black text-sm resize-none focus:ring-2 focus:ring-indigo-500 font-['Pretendard']"
            rows={3}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="self-stretch pt-6 border-t border-black/10 inline-flex justify-end items-center gap-4">
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-3 bg-red-500 rounded-lg text-white text-sm font-medium font-['Pretendard'] hover:bg-red-600"
          >
            일정 삭제
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white rounded-md border border-black/10 text-gray-700 text-sm font-bold font-['Pretendard'] hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-indigo-600 rounded-md shadow-[0px_2px_4px_0px_rgba(59,130,246,0.20)] text-white text-sm font-bold font-['Pretendard'] hover:bg-indigo-700"
          >
            저장 완료
          </button>
        </div>
      </div>

      {showWorkplaceModal && onAddWorkplace && (
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

export default ScheduleEditModal;
