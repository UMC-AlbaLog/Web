import React, { useState, useEffect } from "react";

interface Certification {
  id: string;
  name: string;
}

interface CertificationModalProps {
  isOpen: boolean;
  certification: Certification | null;
  onClose: () => void;
  onSave: (certification: Certification) => void;
}

const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  certification,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Certification>({
    id: "",
    name: "",
  });

  useEffect(() => {
    if (certification) {
      setFormData(certification);
    } else {
      setFormData({
        id: Date.now().toString(),
        name: "",
      });
    }
  }, [certification, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("자격증 이름을 입력해주세요.");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {certification ? "자격증 수정" : "자격증 추가"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">자격증 이름 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="자격증 이름을 입력하세요"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificationModal;

