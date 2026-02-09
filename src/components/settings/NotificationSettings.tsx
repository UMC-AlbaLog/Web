import React from "react";

interface NotificationSettingsProps {
  notifications: {
    all: boolean;
    workRelated: boolean;
    clockInOut: boolean;
    preWorkStart: boolean;
    substituteRecommendation: boolean;
    newCustomJob: boolean;
    salaryDeposit: boolean;
    doNotDisturb: boolean;
  };
  onNotificationChange: (key: keyof NotificationSettingsProps["notifications"]) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  onNotificationChange,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-base font-semibold text-gray-800">전체 알림</h3>
            </div>
            <button
              onClick={() => onNotificationChange("all")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.all ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.all ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-base font-semibold text-gray-800">근무 관련 알림</h3>
            </div>
            <button
              onClick={() => onNotificationChange("workRelated")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.workRelated ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.workRelated ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 mb-0.5">출근/퇴근 시간 알림</h3>
              <p className="text-xs text-gray-500">출퇴근 체크를 잊지 않도록 시작/종료 시간에 알림</p>
            </div>
            <button
              onClick={() => onNotificationChange("clockInOut")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.clockInOut ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.clockInOut ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 mb-0.5">근무 시작 전 알림</h3>
              <p className="text-xs text-gray-500">출퇴근 체크를 잊지 않도록 시작/종료 시간에 알림</p>
            </div>
            <button
              onClick={() => onNotificationChange("preWorkStart")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.preWorkStart ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.preWorkStart ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 mb-0.5">대타 추천 관련 알림</h3>
              <p className="text-xs text-gray-500">대타 근무 추천을 해드려요.</p>
            </div>
            <button
              onClick={() => onNotificationChange("substituteRecommendation")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.substituteRecommendation ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.substituteRecommendation ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 mb-0.5">신규 맞춤 대타 공고 알림</h3>
            </div>
            <button
              onClick={() => onNotificationChange("newCustomJob")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.newCustomJob ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.newCustomJob ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-4">기타 설정</h2>
        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 mb-0.5">급여 입금 알림</h3>
              <p className="text-xs text-gray-500">월급이 정산되었을 때 알림</p>
            </div>
            <button
              onClick={() => onNotificationChange("salaryDeposit")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.salaryDeposit ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.salaryDeposit ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 mb-0.5">야간 방해 금지</h3>
              <p className="text-xs text-gray-500">오후 10시 ~ 오전 7시 사이에는 알림 끄기</p>
            </div>
            <button
              onClick={() => onNotificationChange("doNotDisturb")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.doNotDisturb ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.doNotDisturb ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;


