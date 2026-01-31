import { useState } from 'react';
import type { ScheduleItem, Workplace, ScheduleType, SalaryType } from '../../types/schedule';
import { SCHEDULE_COLORS } from '../../types/schedule';
import AddWorkplaceModal from './AddWorkplaceModal';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

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
  const [scheduleName, setScheduleName] = useState(schedule.scheduleName || '');
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    schedule.scheduleType ?? 'work'
  );
  const [salaryType, setSalaryType] = useState<SalaryType>(
    schedule.salaryType ?? 'hourly'
  );
  const [selectedWorkplace, setSelectedWorkplace] = useState(schedule.workplaceId);
  const [date, setDate] = useState(schedule.date);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);
  const [breakMinutes, setBreakMinutes] = useState(schedule.breakMinutes?.toString() || '');
  const [hourlyWage, setHourlyWage] = useState(schedule.hourlyWage?.toString() || '');
  const [dailyWage, setDailyWage] = useState(schedule.dailyWage?.toString() || '');
  const [memo, setMemo] = useState(schedule.memo || '');
  const [repeatType, setRepeatType] = useState(schedule.repeatType ?? 'none');
  const [repeatDays, setRepeatDays] = useState<number[]>(schedule.repeatDays ?? []);
  const [color, setColor] = useState(schedule.color || '');
  const [notification, setNotification] = useState(schedule.notification ?? false);
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);

  const wp = workplaces.find((w) => w.id === selectedWorkplace);
  const displayColor = color || wp?.color || SCHEDULE_COLORS[0];

  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const handleSubmit = () => {
    if (scheduleType === 'work' && (!selectedWorkplace || !date || !startTime || !endTime)) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    const updatedSchedule: ScheduleItem = {
      ...schedule,
      scheduleName: scheduleName || wp?.name,
      scheduleType,
      salaryType,
      workplaceId: selectedWorkplace,
      date,
      startTime: scheduleType === 'holiday' ? '00:00' : startTime,
      endTime: scheduleType === 'holiday' ? '00:00' : endTime,
      breakMinutes: breakMinutes ? Number(breakMinutes) : undefined,
      hourlyWage: hourlyWage ? Number(hourlyWage) : undefined,
      dailyWage: dailyWage ? Number(dailyWage) : undefined,
      memo: memo || undefined,
      repeatType,
      repeatDays: repeatType !== 'none' ? repeatDays : undefined,
      color: color || undefined,
      notification,
    };

    onSave(updatedSchedule);
  };

  const handleDelete = () => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      onDelete(schedule.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">일정 수정</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* 일정 상태(유형) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">일정 상태</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editScheduleType"
                  checked={scheduleType === 'work'}
                  onChange={() => setScheduleType('work')}
                  className="text-indigo-600"
                />
                <span>근무</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editScheduleType"
                  checked={scheduleType === 'holiday'}
                  onChange={() => setScheduleType('holiday')}
                  className="text-indigo-600"
                />
                <span>휴무</span>
              </label>
            </div>
          </div>

          {/* 일정 명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">일정 명</label>
            <input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder={wp?.name}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 일정 유형 = 작업장 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">일정 유형 (작업장)</label>
            <select
              value={selectedWorkplace}
              onChange={(e) => setSelectedWorkplace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              {workplaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowWorkplaceModal(true)}
              className="mt-1 text-indigo-600 text-sm hover:underline"
            >
              + 새로운 유형
            </button>
          </div>

          {scheduleType === 'work' && (
            <>
              {/* 근무 급여 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">근무 급여 유형</label>
                <div className="flex flex-wrap gap-4">
                  {(['hourly', 'daily', 'monthly', 'per_task'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editSalaryType"
                        checked={salaryType === type}
                        onChange={() => setSalaryType(type)}
                        className="text-indigo-600"
                      />
                      <span>
                        {type === 'hourly' && '시급'}
                        {type === 'daily' && '일급'}
                        {type === 'monthly' && '월급'}
                        {type === 'per_task' && '건당'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 근무 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">근무 시간</label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg flex-1"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg flex-1"
                  />
                </div>
              </div>

              {/* 쉬는 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">쉬는 시간 (분)</label>
                <input
                  type="number"
                  min={0}
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              {/* 시급/일급 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">시급 / 일급</label>
                <div className="flex gap-2">
                  {salaryType === 'hourly' ? (
                    <input
                      type="number"
                      min={0}
                      value={hourlyWage}
                      onChange={(e) => setHourlyWage(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg w-28"
                    />
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={dailyWage}
                      onChange={(e) => setDailyWage(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg w-28"
                    />
                  )}
                  <span className="text-gray-500">원</span>
                </div>
              </div>
            </>
          )}

          {/* 일정 기간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">일정 기간</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">반복</span>
              <select
                value={repeatType}
                onChange={(e) =>
                  setRepeatType(e.target.value as 'none' | 'daily' | 'weekly' | 'biweekly')
                }
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value="none">없음</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="biweekly">격주</option>
              </select>
            </div>
          </div>

          {/* 요일 선택 */}
          {repeatType !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">요일 선택</label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                  <label
                    key={dayIndex}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={repeatDays.includes(dayIndex)}
                      onChange={() => toggleRepeatDay(dayIndex)}
                      className="text-indigo-600 rounded"
                    />
                    <span className="text-sm">{DAY_LABELS[dayIndex]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 색상 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">색상 선택</label>
            <div className="flex gap-2 flex-wrap">
              {SCHEDULE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    displayColor === c ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`색상 ${c}`}
                />
              ))}
            </div>
          </div>

          {/* 알림 설정 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notification}
                onChange={(e) => setNotification(e.target.checked)}
                className="text-indigo-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">알림 설정</span>
            </label>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg h-20 resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600"
          >
            일정 삭제
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              수정 완료
            </button>
          </div>
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
