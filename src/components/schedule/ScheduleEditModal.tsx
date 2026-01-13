import { useState } from 'react';
import type { ScheduleItem, Workplace } from '../../types/schedule';

interface ScheduleEditModalProps {
  schedule: ScheduleItem;
  workplaces: Workplace[];
  onSave: (schedule: ScheduleItem) => void;
  onDelete: (scheduleId: string) => void;
  onClose: () => void;
}

const ScheduleEditModal = ({
  schedule,
  workplaces,
  onSave,
  onDelete,
  onClose,
}: ScheduleEditModalProps) => {
  const [selectedWorkplace, setSelectedWorkplace] = useState(schedule.workplaceId);
  const [date, setDate] = useState(schedule.date);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);
  const [hourlyWage, setHourlyWage] = useState(schedule.hourlyWage?.toString() || '');
  const [memo, setMemo] = useState(schedule.memo || '');

  const handleSubmit = () => {
    if (!selectedWorkplace || !date || !startTime || !endTime) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const updatedSchedule: ScheduleItem = {
      ...schedule,
      workplaceId: selectedWorkplace,
      date,
      startTime,
      endTime,
      hourlyWage: hourlyWage ? parseFloat(hourlyWage) : undefined,
      memo,
    };

    onSave(updatedSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">일정 수정</h2>

        {/* 알바 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">알바 선택</label>
          <select
            value={selectedWorkplace}
            onChange={(e) => setSelectedWorkplace(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {workplaces.map(workplace => (
              <option key={workplace.id} value={workplace.id}>
                {workplace.name}
              </option>
            ))}
          </select>
        </div>

        {/* 날짜 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 시간 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">시작 시간</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">종료 시간</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* 시급 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">시급 (선택)</label>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(e.target.value)}
            placeholder="시급을 입력하세요"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 메모 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            className="w-full p-2 border border-gray-300 rounded h-20"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-between">
          <button
            onClick={() => {
              if (confirm('정말 삭제하시겠습니까?')) {
                onDelete(schedule.id);
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            삭제
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditModal;

