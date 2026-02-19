import React, { useState } from "react";

interface WorkExperience {
  id: string;
  company: string;
  location: string;
  period: string;
  description?: string;
}

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  experiences,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800">알바 경험 이력</h3>
        </div>
        <button
          onClick={onAdd}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 추가하기
        </button>
      </div>
      <div className="space-y-3">
        {experiences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">추가된 경험이 없습니다.</p>
          </div>
        ) : (
          experiences.map((exp) => (
            <div key={exp.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 mb-1">{exp.company || "회사명 없음"}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  {exp.location && exp.period 
                    ? `${exp.location} · ${exp.period}`
                    : exp.location || exp.period || "정보 없음"}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(exp.id)}
                  className="text-xs text-gray-600 hover:text-blue-600"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(exp.id)}
                  className="text-xs text-gray-600 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkExperienceSection;

