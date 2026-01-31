import { useState, useMemo } from 'react';
import type { ScheduleItem, Workplace, ScheduleType, SalaryType } from '../../types/schedule';
import { calculateDuration } from '../../utils/scheduleUtils';
import AddWorkplaceModal from './AddWorkplaceModal';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']; // 1-7 → 0-6: 월=0, 일=6

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
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('work');
  const [salaryType, setSalaryType] = useState<SalaryType>('hourly');
  const [selectedWorkplace, setSelectedWorkplace] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const [memo, setMemo] = useState('');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'biweekly'>('none');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]); // 월~금 기본
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);

  const hours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    return Math.max(0, calculateDuration(startTime, endTime) - (Number(breakMinutes) || 0) / 60);
  }, [startTime, endTime, breakMinutes]);

  const estimatedSalary = useMemo(() => {
    if (scheduleType === 'holiday') return 0;
    const wage = salaryType === 'daily' ? Number(dailyWage) || 0 : (Number(hourlyWage) || 0) * hours;
    return Math.round(wage);
  }, [scheduleType, salaryType, hourlyWage, dailyWage, hours]);

  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const handleSubmit = () => {
    if (scheduleType === 'work' && (!selectedWorkplace || !date || !startTime || !endTime)) {
      alert('일정 명, 날짜, 근무 시간을 입력해주세요.');
      return;
    }
    if (scheduleType === 'holiday' && !date) {
      alert('날짜를 선택해주세요.');
      return;
    }

    const wp = workplaces.find((w) => w.id === selectedWorkplace);
    const nameToUse = scheduleName || wp?.name || (scheduleType === 'holiday' ? '휴무' : '일정');
    const workplaceId = selectedWorkplace || (workplaces[0]?.id ?? '');
    const isHoliday = scheduleType === 'holiday';

    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      workplaceId,
      date: date || new Date().toISOString().slice(0, 10),
      startTime: isHoliday ? '00:00' : startTime || '09:00',
      endTime: isHoliday ? '00:00' : endTime || '18:00',
      scheduleName: nameToUse,
      scheduleType,
      salaryType,
      breakMinutes: breakMinutes ? Number(breakMinutes) : undefined,
      hourlyWage: hourlyWage ? Number(hourlyWage) : undefined,
      dailyWage: dailyWage ? Number(dailyWage) : undefined,
      memo: memo || undefined,
      repeatType,
      repeatDays: repeatType !== 'none' ? repeatDays : undefined,
    };

    onSave(newSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">새 일정 급여 추가</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* 1. 일정 명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">1. 일정 명</label>
            <input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="일정 이름을 입력하세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 2. 일정 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">2. 일정 유형</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={scheduleType === 'work'}
                  onChange={() => setScheduleType('work')}
                  className="text-indigo-600"
                />
                <span>근무</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={scheduleType === 'holiday'}
                  onChange={() => setScheduleType('holiday')}
                  className="text-indigo-600"
                />
                <span>휴무</span>
              </label>
              <button
                type="button"
                onClick={() => setShowWorkplaceModal(true)}
                className="text-indigo-600 text-sm hover:underline"
              >
                + 새로운 유형
              </button>
            </div>
          </div>

          {scheduleType === 'work' && (
            <>
              {/* 3. 근무 급여 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">3. 근무 급여 유형</label>
                <div className="flex flex-wrap gap-4">
                  {(['hourly', 'daily', 'monthly', 'per_task'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="salaryType"
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

              {/* 알바(작업장) 선택 - 일정 명 대체 가능 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">작업장</label>
                <select
                  value={selectedWorkplace}
                  onChange={(e) => setSelectedWorkplace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">선택하세요</option>
                  {workplaces.map((wp) => (
                    <option key={wp.id} value={wp.id}>
                      {wp.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* 4. 일정 기간 + 반복 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">4. 일정 기간</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-500 text-sm">반복</span>
              <select
                value={repeatType}
                onChange={(e) =>
                  setRepeatType(e.target.value as 'none' | 'daily' | 'weekly' | 'biweekly')
                }
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="none">없음</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="biweekly">격주</option>
              </select>
            </div>
          </div>

          {/* 5. 요일 선택 */}
          {repeatType !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">5. 요일 선택</label>
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

          {scheduleType === 'work' && (
            <>
              {/* 6. 근무 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">6. 근무 시간</label>
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

              {/* 7. 쉬는 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">7. 쉬는 시간 (분)</label>
                <input
                  type="number"
                  min={0}
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              {/* 8. 시급 / 일급, 예상 급여 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  8. 시급 / 일급
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {salaryType === 'hourly' ? (
                    <input
                      type="number"
                      min={0}
                      value={hourlyWage}
                      onChange={(e) => setHourlyWage(e.target.value)}
                      placeholder="5,000"
                      className="px-3 py-2 border border-gray-200 rounded-lg w-28"
                    />
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={dailyWage}
                      onChange={(e) => setDailyWage(e.target.value)}
                      placeholder="50,000"
                      className="px-3 py-2 border border-gray-200 rounded-lg w-28"
                    />
                  )}
                  <span className="text-gray-500">원</span>
                  <span className="text-indigo-600 font-medium ml-auto">
                    예상 급여 {estimatedSalary.toLocaleString()}원
                  </span>
                </div>
              </div>
            </>
          )}

          {/* 9. 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">9. 메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg h-20 resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
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
