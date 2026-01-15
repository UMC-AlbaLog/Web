import { useState } from 'react';
import type { Workplace } from '../../types/schedule';

interface AddWorkplaceModalProps {
  onSave: (workplace: Workplace) => void;
  onClose: () => void;
}

const AddWorkplaceModal = ({ onSave, onClose }: AddWorkplaceModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF6B6B');

  const handleSubmit = () => {
    if (!name) {
      alert('알바 이름을 입력해주세요.');
      return;
    }

    const newWorkplace: Workplace = {
      id: Date.now().toString(),
      name,
      color,
    };

    onSave(newWorkplace);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">새 알바 등록</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">알바 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 카페 A"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">색상</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 p-1 border border-gray-300 rounded"
          />
        </div>

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
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWorkplaceModal;


