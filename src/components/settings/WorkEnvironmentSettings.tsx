import React from "react";

interface WorkEnvironmentSettingsProps {
  selectedAreas: string[];
  weekStartDay: string;
  use24Hour: boolean;
  onAddRegion: () => void;
  onRemoveRegion: (area: string) => void;
  onWeekStartDayChange: (day: string) => void;
  onUse24HourChange: (use: boolean) => void;
}

const WorkEnvironmentSettings: React.FC<WorkEnvironmentSettingsProps> = ({
  selectedAreas,
  weekStartDay,
  use24Hour,
  onAddRegion,
  onRemoveRegion,
  onWeekStartDayChange,
  onUse24HourChange,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 min-h-full">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-2">근무 환경 설정</h2>
        <p className="text-sm text-gray-600 mb-8">주 활동 지역과 캘린더 표시 방식을 설정합니다.</p>

        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-2">주 활동 지역</h3>
          <p className="text-sm text-gray-600 mb-4">주로 근무하는 지역을 최대 3개까지 설정할 수 있습니다.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-blue-700"
              >
                {area}
                <button
                  onClick={() => onRemoveRegion(area)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          {selectedAreas.length < 3 && (
            <button
              onClick={onAddRegion}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              + 지역 추가
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">한 주의 시작 요일</h3>
            <p className="text-sm text-gray-600 mb-4">캘린더에서 한 주의 시작을 설정합니다.</p>
            <div className="flex gap-2">
              <button
                onClick={() => onWeekStartDayChange("일요일")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  weekStartDay === "일요일"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-white text-gray-600 border border-gray-300"
                }`}
              >
                일요일
              </button>
              <button
                onClick={() => onWeekStartDayChange("월요일")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  weekStartDay === "월요일"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-white text-gray-600 border border-gray-300"
                }`}
              >
                월요일
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-800 mb-2">24시간 형식 사용</h3>
              <p className="text-sm text-gray-600">오전/오후 대신 13:00 형식으로 시간을 표시합니다.</p>
            </div>
            <button
              onClick={() => onUse24HourChange(!use24Hour)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                use24Hour ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  use24Hour ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkEnvironmentSettings;

