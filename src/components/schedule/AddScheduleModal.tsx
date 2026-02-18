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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-[480px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden rounded-[10px] bg-white px-6 py-8 shadow-[0px_10px_25px_0px_rgba(0,0,0,0.15)]">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between self-stretch">
          <h2 className="font-['Pretendard'] text-xl font-semibold text-slate-900">새 알바 일정 추가</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center text-slate-500 hover:text-slate-700"
            aria-label="닫기"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="mt-6 flex flex-1 flex-col items-start gap-6 overflow-y-auto min-h-0">
          {/* 1. 근무지 선택 */}
          <div className="flex w-full flex-col items-start gap-3">
            <div className="font-['Pretendard'] text-base font-semibold text-slate-900">1. 근무지 선택</div>
            <div className="inline-flex w-full flex-wrap items-center gap-3">
              {workplaces.map((wp) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => setSelectedWorkplace(wp.id)}
                  className={`flex h-10 items-center justify-center rounded-md px-4 py-2.5 font-['Pretendard'] text-base font-medium ${
                    selectedWorkplace === wp.id
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-100 text-black hover:bg-slate-200"
                  }`}
                >
                  {wp.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowWorkplaceModal(true)}
                className="flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 py-2.5 font-['Pretendard'] text-base font-medium text-black hover:bg-slate-200"
              >
                + 새 알바 등록하기
              </button>
            </div>
          </div>

          {/* 2. 날짜 선택 */}
          <div className="flex w-full flex-col items-start gap-3">
            <div className="font-['Pretendard'] text-base font-semibold text-slate-900">2. 날짜 선택</div>
            <div className="inline-flex w-full items-center gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-56 rounded-md border-0 bg-slate-100 px-4 py-2 font-['Pretendard'] text-base font-medium text-black focus:ring-2 focus:ring-indigo-500"
              />
              <span className="flex h-10 items-center rounded-md bg-slate-100 px-4 py-2.5 font-['Pretendard'] text-base font-medium text-black pointer-events-none">
                달력
              </span>
            </div>
          </div>

          {/* 3. 시간 선택 */}
          <div className="flex w-full flex-col items-start gap-3">
            <div className="font-['Pretendard'] text-base font-semibold text-slate-900">3. 시간 선택</div>
            <div className="inline-flex w-full items-center gap-3">
              <span className="font-['Pretendard'] text-base font-medium text-black">시작</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 min-w-[140px] w-36 rounded-md border-0 bg-slate-100 px-4 py-2 font-['Pretendard'] text-base font-medium text-black"
              />
              <span className="pl-3 font-['Pretendard'] text-base font-medium text-black">끝</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 min-w-[140px] w-36 rounded-md border-0 bg-slate-100 px-4 py-2 font-['Pretendard'] text-base font-medium text-black"
              />
            </div>
          </div>

          {/* 4. 반복 설정 */}
          <div className="flex w-full flex-col items-start gap-3">
            <div className="font-['Pretendard'] text-base font-semibold text-slate-900">4. 반복 설정</div>
            <div className="flex w-full flex-col items-start gap-2.5">
              <div className="inline-flex w-full items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRepeatType("none")}
                  className={`rounded-2xl px-4 pt-1.5 pb-2 font-['Pretendard'] text-sm font-medium min-w-14 h-8 ${
                    repeatType === "none"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-100 text-black hover:bg-slate-200"
                  }`}
                >
                  없음
                </button>
                <button
                  type="button"
                  onClick={() => setRepeatType("daily")}
                  className={`rounded-2xl px-4 pt-1.5 pb-2 font-['Pretendard'] text-sm font-medium min-w-14 h-8 ${
                    repeatType === "daily"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-100 text-black hover:bg-slate-200"
                  }`}
                >
                  매일
                </button>
              </div>
              <div className="inline-flex w-full items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRepeatType("weekly")}
                  className={`shrink-0 rounded-2xl px-4 pt-1.5 pb-2 font-['Pretendard'] text-sm font-medium min-w-14 h-8 ${
                    repeatType === "weekly"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-100 text-black hover:bg-slate-200"
                  }`}
                >
                  매주
                </button>
                <div className="flex items-start gap-1.5">
                  {DAY_INDICES.map((dayIndex, i) => (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => repeatType === "weekly" && toggleRepeatDay(dayIndex)}
                      className={`flex h-7 w-7 items-center justify-center rounded-2xl font-['Pretendard'] text-xs font-medium outline outline-1 outline-offset-[-1px] outline-slate-50 ${
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
              <div className="inline-flex w-full items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRepeatType("biweekly")}
                  className={`shrink-0 rounded-2xl px-4 pt-1.5 pb-2 font-['Pretendard'] text-sm font-medium min-w-14 h-8 ${
                    repeatType === "biweekly"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-100 text-black hover:bg-slate-200"
                  }`}
                >
                  격주
                </button>
                <div className="flex items-start gap-1.5">
                  {DAY_INDICES.map((dayIndex, i) => (
                    <button
                      key={`bi-${dayIndex}`}
                      type="button"
                      onClick={() => repeatType === "biweekly" && toggleRepeatDay(dayIndex)}
                      className={`flex h-7 w-7 items-center justify-center rounded-2xl font-['Pretendard'] text-xs font-medium outline outline-1 outline-offset-[-1px] outline-slate-50 ${
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
          <div className="flex w-full flex-col items-start gap-3">
            <div className="font-['Pretendard'] text-base font-semibold text-slate-900">5. 시급 입력</div>
            <div className="inline-flex w-full flex-wrap items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={hourlyWage}
                onChange={(e) => handleWageChange(e.target.value)}
                placeholder="0"
                className="h-10 w-28 rounded-md border-0 bg-slate-100 pl-4 pr-2 py-2 font-['Pretendard'] text-base font-medium text-black text-right focus:ring-2 focus:ring-indigo-500"
              />
              <span className="font-['Pretendard'] text-base font-medium text-black">원</span>
              <span className="font-['Pretendard'] text-base font-semibold text-black">
                예상금액 {estimatedSalary.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 6. 메모 */}
          <div className="flex w-full flex-col items-start gap-3">
            <div className="font-['Pretendard'] text-base font-semibold text-slate-900">6. 메모</div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              className="h-20 w-full resize-none rounded-lg border-0 bg-slate-100 px-4 py-3 font-['Pretendard'] text-base text-black focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-12 w-full shrink-0 rounded-lg bg-indigo-600 pt-3.5 pb-4 font-['Pretendard'] text-base font-medium text-white hover:bg-indigo-700"
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
