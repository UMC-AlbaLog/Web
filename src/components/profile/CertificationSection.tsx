import React from "react";

interface Certification {
  id: string;
  name: string;
}

interface CertificationSectionProps {
  certifications: Certification[];
  onAdd: () => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({
  certifications,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800">보유 자격증</h3>
        </div>
        <button
          onClick={onAdd}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 추가하기
        </button>
      </div>
      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-800">{cert.name}</p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(cert.id)}
                  className="text-xs text-gray-600 hover:text-blue-600"
                >
                  수정
                </button>
              )}
              <button
                onClick={() => onDelete(cert.id)}
                className="text-xs text-gray-600 hover:text-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationSection;



