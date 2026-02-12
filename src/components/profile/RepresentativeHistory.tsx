import React from "react";

interface RepresentativeHistoryProps {
  representativeHistory: {
    storeName: string;
    workPeriod: string;
    totalWorkDays: number;
  };
  isEditing: boolean;
  editingData: {
    storeName: string;
    workPeriod: string;
    totalWorkDays: number;
  };
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDataChange: (data: Partial<RepresentativeHistoryProps["editingData"]>) => void;
}

const RepresentativeHistory: React.FC<RepresentativeHistoryProps> = ({
  representativeHistory,
  isEditing,
  editingData,
  onStartEdit,
  onSave,
  onCancel,
  onDataChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800">대표 이력</h3>
        </div>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            수정
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-lg transition-all duration-300">
          <div className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                매장명
              </label>
              <input
                type="text"
                value={editingData.storeName}
                onChange={(e) => onDataChange({ storeName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                placeholder="매장명을 입력하세요"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                근무 기간
              </label>
              <input
                type="text"
                value={editingData.workPeriod}
                onChange={(e) => onDataChange({ workPeriod: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                placeholder="예: Mar 2021 - Present"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                총 근무일수
              </label>
              <input
                type="number"
                value={editingData.totalWorkDays}
                onChange={(e) => onDataChange({ totalWorkDays: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                placeholder="근무일수를 입력하세요"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={onSave}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  저장
                </span>
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1 text-lg">
                {representativeHistory.storeName}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {representativeHistory.workPeriod}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  총 {representativeHistory.totalWorkDays}일 근무
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentativeHistory;



