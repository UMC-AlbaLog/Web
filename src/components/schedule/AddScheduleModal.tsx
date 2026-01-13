import { useState } from 'react';
import type { ScheduleItem, Workplace } from '../../types/schedule';
import AddWorkplaceModal from './AddWorkplaceModal';

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
  const [selectedWorkplace, setSelectedWorkplace] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [memo, setMemo] = useState('');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'biweekly'>('none');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);

  const handleSubmit = () => {
    if (!selectedWorkplace || !date || !startTime || !endTime) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      workplaceId: selectedWorkplace,
      date,
      startTime,
      endTime,
      hourlyWage: hourlyWage ? parseFloat(hourlyWage) : undefined,
      memo,
      repeatType,
      repeatDays: repeatType !== 'none' ? repeatDays : undefined,
    };

    onSave(newSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">새 알바 일정 추가</h2>

        {/* 알바 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">알바 선택</label>
          <select
            value={selectedWorkplace}
            onChange={(e) => setSelectedWorkplace(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">선택하세요</option>
            {workplaces.map(workplace => (
              <option key={workplace.id} value={workplace.id}>
                {workplace.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowWorkplaceModal(true)}
            className="mt-2 text-blue-500 hover:underline text-sm"
          >
            + 새 알바 등록하기
          </button>
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

        {/* 반복 설정 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">반복 설정</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="none"
                checked={repeatType === 'none'}
                onChange={() => setRepeatType('none')}
                className="mr-2"
              />
              없음
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="daily"
                checked={repeatType === 'daily'}
                onChange={() => setRepeatType('daily')}
                className="mr-2"
              />
              매일
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="weekly"
                checked={repeatType === 'weekly'}
                onChange={() => setRepeatType('weekly')}
                className="mr-2"
              />
              매주
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="biweekly"
                checked={repeatType === 'biweekly'}
                onChange={() => setRepeatType('biweekly')}
                className="mr-2"
              />
              격주
            </label>
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
        <div className="flex justify-end gap-2">
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

      {/* 새 알바 등록 모달 */}
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

