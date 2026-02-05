import { useState, useMemo } from "react";
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-[480px] px-6 py-8 bg-white rounded-[10px] shadow-[0px_10px_25px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-center items-start gap-6">
        {/* 헤더 */}
        <div className="self-stretch inline-flex justify-between items-center">
          <h2 className="text-slate-900 text-xl font-semibold font-['Pretendard']">새 알바 일정 추가</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex justify-center items-center text-slate-500 hover:text-slate-700"
            aria-label="닫기"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        {/* 1. 근무지 선택 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="text-slate-900 text-base font-semibold font-['Pretendard']">1. 근무지 선택</div>
          <div className="self-stretch inline-flex justify-start items-center gap-3 flex-wrap">
            {workplaces.map((wp) => (
              <button
                key={wp.id}
                type="button"
                onClick={() => setSelectedWorkplace(wp.id)}
                className={`h-10 px-4 py-2.5 rounded-md flex justify-center items-center text-base font-medium font-['Pretendard'] ${
                  selectedWorkplace === wp.id ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                {wp.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowWorkplaceModal(true)}
              className="h-10 px-4 py-2.5 bg-slate-100 rounded-md flex justify-center items-center text-black text-base font-medium font-['Pretendard'] hover:bg-slate-200"
            >
              + 새 알바 등록하기
            </button>
          </div>
        </div>

        {/* 2. 날짜 선택 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="text-slate-900 text-base font-semibold font-['Pretendard']">2. 날짜 선택</div>
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-56 h-10 px-4 py-2 bg-slate-100 rounded-md text-black text-base font-medium border-0 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="h-10 px-4 py-2.5 bg-slate-100 rounded-md flex items-center text-black text-base font-medium font-['Pretendard'] pointer-events-none">
              달력
            </span>
          </div>
        </div>

        {/* 3. 시간 선택 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="text-slate-900 text-base font-semibold font-['Pretendard']">3. 시간 선택</div>
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <span className="text-black text-base font-medium font-['Pretendard']">시작</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="min-w-[140px] w-36 h-10 px-4 py-2 bg-slate-100 rounded-md text-black text-base font-medium border-0"
            />
            <span className="text-black text-base font-medium font-['Pretendard'] pl-3">끝</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="min-w-[140px] w-36 h-10 px-4 py-2 bg-slate-100 rounded-md text-black text-base font-medium border-0"
            />
          </div>
        </div>

        {/* 4. 반복 설정 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="text-slate-900 text-base font-semibold font-['Pretendard']">4. 반복 설정</div>
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <button
                type="button"
                onClick={() => setRepeatType("none")}
                className={`h-8 min-w-14 px-4 pt-1.5 pb-2 rounded-2xl text-sm font-medium font-['Pretendard'] ${
                  repeatType === "none" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                없음
              </button>
              <button
                type="button"
                onClick={() => setRepeatType("daily")}
                className={`h-8 min-w-14 px-4 pt-1.5 pb-2 rounded-2xl text-sm font-medium font-['Pretendard'] ${
                  repeatType === "daily" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                매일
              </button>
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-3">
              <button
                type="button"
                onClick={() => setRepeatType("weekly")}
                className={`h-8 min-w-14 px-4 pt-1.5 pb-2 rounded-2xl text-sm font-medium font-['Pretendard'] shrink-0 ${
                  repeatType === "weekly" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                매주
              </button>
              <div className="flex justify-start items-start gap-1.5">
                {DAY_INDICES.map((dayIndex, i) => (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => repeatType === "weekly" && toggleRepeatDay(dayIndex)}
                    className={`w-7 h-7 rounded-2xl flex justify-center items-center text-xs font-medium font-['Pretendard'] outline outline-1 outline-offset-[-1px] outline-slate-50 ${
                      repeatType === "weekly" && repeatDays.includes(dayIndex)
                        ? "bg-indigo-100 text-indigo-800 outline-indigo-200"
                        : "bg-violet-50 text-black hover:bg-violet-100"
                    }`}
                  >
                    {DAY_LABELS[i]}
                  </button>
                ))}
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-3">
              <button
                type="button"
                onClick={() => setRepeatType("biweekly")}
                className={`h-8 min-w-14 px-4 pt-1.5 pb-2 rounded-2xl text-sm font-medium font-['Pretendard'] shrink-0 ${
                  repeatType === "biweekly" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                격주
              </button>
              <div className="flex justify-start items-start gap-1.5">
                {DAY_INDICES.map((dayIndex, i) => (
                  <button
                    key={`bi-${dayIndex}`}
                    type="button"
                    onClick={() => repeatType === "biweekly" && toggleRepeatDay(dayIndex)}
                    className={`w-7 h-7 rounded-2xl flex justify-center items-center text-xs font-medium font-['Pretendard'] outline outline-1 outline-offset-[-1px] outline-slate-50 ${
                      repeatType === "biweekly" && repeatDays.includes(dayIndex)
                        ? "bg-indigo-100 text-indigo-800 outline-indigo-200"
                        : "bg-violet-50 text-black hover:bg-violet-100"
                    }`}
                  >
                    {DAY_LABELS[i]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. 시급 입력 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="text-slate-900 text-base font-semibold font-['Pretendard']">5. 시급 입력</div>
          <div className="self-stretch inline-flex justify-start items-center gap-2 flex-wrap">
            <input
              type="text"
              inputMode="numeric"
              value={hourlyWage}
              onChange={(e) => handleWageChange(e.target.value)}
              placeholder="0"
              className="w-28 h-10 pl-4 pr-2 py-2 bg-slate-100 rounded-md text-black text-base font-medium text-right border-0 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-black text-base font-medium font-['Pretendard']">원</span>
            <span className="text-black text-base font-semibold font-['Pretendard']">
              예상금액 {estimatedSalary.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 6. 메모 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="text-slate-900 text-base font-semibold font-['Pretendard']">6. 메모</div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            className="self-stretch h-20 px-4 py-3 bg-slate-100 rounded-lg resize-none text-black text-base border-0 focus:ring-2 focus:ring-indigo-500 font-['Pretendard']"
            rows={3}
          />
        </div>

        {/* 일정 추가하기 */}
        <button
          type="button"
          onClick={handleSubmit}
          className="self-stretch h-12 pt-3.5 pb-4 bg-indigo-600 rounded-lg inline-flex justify-center items-center text-white text-base font-medium font-['Pretendard'] hover:bg-indigo-700"
        >
          일정 추가하기
        </button>
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
