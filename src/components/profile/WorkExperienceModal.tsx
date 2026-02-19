import React, { useState, useEffect } from "react";

interface WorkExperience {
  id: string;
  company: string;
  location: string;
  period: string;
  description?: string;
}

interface WorkExperienceModalProps {
  isOpen: boolean;
  experience: WorkExperience | null;
  onClose: () => void;
  onSave: (experience: WorkExperience) => void;
}

const WorkExperienceModal: React.FC<WorkExperienceModalProps> = ({
  isOpen,
  experience,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<WorkExperience>({
    id: "",
    company: "",
    location: "",
    period: "",
    description: "",
  });

  useEffect(() => {
    if (experience) {
      setFormData(experience);
    } else {
      setFormData({
        id: Date.now().toString(),
        company: "",
        location: "",
        period: "",
        description: "",
      });
    }
  }, [experience, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.location.trim() || !formData.period.trim()) {
      alert("회사명, 위치, 기간을 모두 입력해주세요.");
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
            {experience ? "경험 수정" : "경험 추가"}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">회사명 *</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="회사명을 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">위치 *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="위치를 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기간 *</label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 2021.03 - 2023.05"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="추가 설명을 입력하세요"
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

export default WorkExperienceModal;

