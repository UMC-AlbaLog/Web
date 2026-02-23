import React, { useState, useEffect } from "react";
import { getSettlement, updateSettlement } from "../api/settlement";
import { type Place } from "../api/places";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import NotificationSettings from "../components/settings/NotificationSettings";
import SettlementSettings from "../components/settings/SettlementSettings";
import WorkEnvironmentSettings from "../components/settings/WorkEnvironmentSettings";
import RegionSearchModal from "../components/settings/RegionSearchModal";

type TabType = "notification" | "settlement" | "workEnvironment";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("notification");
  const [isEditingSettlement, setIsEditingSettlement] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [settlementData, setSettlementData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [isLoadingSettlement, setIsLoadingSettlement] = useState(false);

  // 저장된 알림 설정 불러오기 (손상된 저장값 방지)
  const loadNotificationSettings = (): Record<string, boolean> => {
    try {
      const saved = sessionStorage.getItem("notificationSettings");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      all: true,
      workRelated: true,
      clockInOut: true,
      preWorkStart: true,
      substituteRecommendation: true,
      newCustomJob: false,
      salaryDeposit: true,
      doNotDisturb: false,
    };
  };

  const [notifications, setNotifications] = useState(loadNotificationSettings);

  // 저장된 근무 환경 설정 불러오기 (손상된 저장값 방지)
  const loadWorkEnvironment = (): { selectedAreas: string[]; weekStartDay: string; use24Hour: boolean } => {
    try {
      const saved = localStorage.getItem("workEnvironment");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      selectedAreas: ["서울 강남구", "경기 성남시 분당구"],
      weekStartDay: "일요일",
      use24Hour: false,
    };
  };

  const [workEnvironment, setWorkEnvironment] = useState(loadWorkEnvironment);

  const koreanRegions = [
    "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산",
    "세종", "강원", "경남", "경북", "전남", "전북", "충남", "충북", "제주"
  ];

  // 정산 정보 로드 함수
  const loadSettlementData = async () => {
    try {
      setIsLoadingSettlement(true);
      const data = await getSettlement();
      setSettlementData({
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        accountHolder: data.accountHolder || "",
      });
    } catch (error) {
      console.error("정산 정보 로드 실패:", error);
      // 에러 발생 시 기본값 유지
    } finally {
      setIsLoadingSettlement(false);
    }
  };

  // 정산 정보 로드
  useEffect(() => {
    loadSettlementData();
  }, []);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev: typeof notifications) => {
      const updated: typeof notifications = {
        ...prev,
        [key]: !prev[key],
      };
      
      // 전체 알림이 꺼지면 모든 알림도 꺼짐
      if (key === "all" && !updated.all) {
        updated.workRelated = false;
        updated.clockInOut = false;
        updated.preWorkStart = false;
        updated.substituteRecommendation = false;
        updated.newCustomJob = false;
        updated.salaryDeposit = false;
        updated.doNotDisturb = false;
      }
      // 전체 알림이 켜지면 기본 알림들도 켜짐
      if (key === "all" && updated.all) {
        updated.workRelated = true;
        updated.clockInOut = true;
        updated.preWorkStart = true;
        updated.substituteRecommendation = true;
        updated.salaryDeposit = true;
      }
      
      sessionStorage.setItem("notificationSettings", JSON.stringify(updated));
      
      // 알림 권한 요청 및 테스트 알림
      if (updated[key]) {
        requestNotificationPermission(key);
      }
      
      return updated;
    });
  };

  // 알림 권한 요청 및 알림 보내기
  const requestNotificationPermission = async (key: keyof typeof notifications) => {
    if (!("Notification" in window)) {
      if (import.meta.env.DEV) console.log("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }

    if (Notification.permission === "granted") {
      showNotification(key);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        showNotification(key);
      }
    }
  };

  // 알림 표시
  const showNotification = (key: keyof typeof notifications) => {
    const notificationMessages: Record<keyof typeof notifications, { title: string; body: string }> = {
      all: { title: "전체 알림", body: "모든 알림이 활성화되었습니다." },
      workRelated: { title: "근무 관련 알림", body: "근무 관련 알림이 활성화되었습니다." },
      clockInOut: { title: "출퇴근 알림", body: "출퇴근 시간에 알림을 받을 수 있습니다." },
      preWorkStart: { title: "근무 시작 전 알림", body: "근무 시작 전 알림이 활성화되었습니다." },
      substituteRecommendation: { title: "대타 추천 알림", body: "대타 근무 추천 알림이 활성화되었습니다." },
      newCustomJob: { title: "신규 맞춤 대타 공고", body: "새로운 맞춤 대타 공고 알림이 활성화되었습니다." },
      salaryDeposit: { title: "급여 입금 알림", body: "급여 입금 시 알림을 받을 수 있습니다." },
      doNotDisturb: { title: "야간 방해 금지", body: "오후 10시 ~ 오전 7시 사이 알림이 꺼집니다." },
    };

    const message = notificationMessages[key];
    if (message && Notification.permission === "granted") {
      new Notification(message.title, {
        body: message.body,
        icon: "/favicon.ico",
      });
    }
  };

  // 출퇴근 시간 알림 시뮬레이션 (실제로는 스케줄에 따라 동작)
  React.useEffect(() => {
    if (!notifications.clockInOut || !notifications.all) return;

    const checkClockInOut = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // 예시: 오전 9시와 오후 6시에 알림 (실제로는 사용자의 스케줄에 따라)
      if ((hours === 9 && minutes === 0) || (hours === 18 && minutes === 0)) {
        if (Notification.permission === "granted") {
          new Notification("출퇴근 시간 알림", {
            body: hours === 9 ? "출근 시간입니다. 출근 체크를 해주세요." : "퇴근 시간입니다. 퇴근 체크를 해주세요.",
            icon: "/favicon.ico",
          });
        }
      }
    };

    const interval = setInterval(checkClockInOut, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, [notifications.clockInOut, notifications.all]);

  // 근무 시작 전 알림 시뮬레이션
  React.useEffect(() => {
    if (!notifications.preWorkStart || !notifications.all) return;

    const checkPreWorkStart = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // 예시: 근무 시작 30분 전 알림 (실제로는 사용자의 스케줄에 따라)
      // 여기서는 시뮬레이션으로 특정 시간에 알림
      if (hours === 8 && minutes === 30) {
        if (Notification.permission === "granted") {
          new Notification("근무 시작 전 알림", {
            body: "곧 근무가 시작됩니다. 출근 체크를 준비해주세요.",
            icon: "/favicon.ico",
          });
        }
      }
    };

    const interval = setInterval(checkPreWorkStart, 60000);
    return () => clearInterval(interval);
  }, [notifications.preWorkStart, notifications.all]);

  // 야간 방해 금지 기능
  React.useEffect(() => {
    if (!notifications.doNotDisturb) return;

    const checkDoNotDisturb = () => {
      const now = new Date();
      const hours = now.getHours();

      // 오후 10시 ~ 오전 7시 사이에는 알림이 꺼짐
      if (hours >= 22 || hours < 7) {
        if (import.meta.env.DEV) console.log("야간 방해 금지 시간대입니다.");
      }
    };

    const interval = setInterval(checkDoNotDisturb, 60000);
    return () => clearInterval(interval);
  }, [notifications.doNotDisturb]);

  const handleSettlementEdit = async () => {
    if (isEditingSettlement) {
      // 저장 로직
      try {
        setIsLoadingSettlement(true);
        await updateSettlement({
          bankName: settlementData.bankName,
          accountNumber: settlementData.accountNumber,
          accountHolder: settlementData.accountHolder,
        });
        // 저장 성공 후 최신 데이터 다시 불러오기
        await loadSettlementData();
        alert("정산 정보가 성공적으로 변경되었습니다.");
        setIsEditingSettlement(false);
      } catch (error) {
        console.error("정산 정보 저장 실패:", error);
        alert(error instanceof Error ? error.message : "정산 정보 저장에 실패했습니다.");
      } finally {
        setIsLoadingSettlement(false);
      }
    } else {
      setIsEditingSettlement(true);
    }
  };

  const handleAddRegion = () => {
    if (workEnvironment.selectedAreas.length < 3) {
      setShowRegionModal(true);
    }
  };

  const handleRemoveRegion = (area: string) => {
    const updated = {
      ...workEnvironment,
      selectedAreas: workEnvironment.selectedAreas.filter((a: string) => a !== area),
    };
    setWorkEnvironment(updated);
    localStorage.setItem("workEnvironment", JSON.stringify(updated));
  };

  const handleRegionSelect = (place: Place) => {
    const newArea = place.address || place.name;
    if (!workEnvironment.selectedAreas.includes(newArea) && workEnvironment.selectedAreas.length < 3) {
      setWorkEnvironment({
        ...workEnvironment,
        selectedAreas: [...workEnvironment.selectedAreas, newArea],
      });
    }
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] flex h-full">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 p-8 overflow-y-auto bg-[#F3F4F6] h-full">
        {activeTab === "notification" && notifications && (
          <NotificationSettings
            notifications={{
              all: notifications.all ?? false,
              workRelated: notifications.workRelated ?? false,
              clockInOut: notifications.clockInOut ?? false,
              preWorkStart: notifications.preWorkStart ?? false,
              substituteRecommendation: notifications.substituteRecommendation ?? false,
              newCustomJob: notifications.newCustomJob ?? false,
              salaryDeposit: notifications.salaryDeposit ?? false,
              doNotDisturb: notifications.doNotDisturb ?? false,
            }}
            onNotificationChange={handleNotificationChange}
          />
        )}

        {activeTab === "settlement" && (
          <SettlementSettings
            settlementData={settlementData}
            isEditing={isEditingSettlement}
            isLoading={isLoadingSettlement}
            onEdit={() => setIsEditingSettlement(true)}
            onSave={handleSettlementEdit}
            onCancel={() => setIsEditingSettlement(false)}
            onSettlementDataChange={(data) => setSettlementData({ ...settlementData, ...data })}
          />
        )}

        {activeTab === "workEnvironment" && (
          <WorkEnvironmentSettings
            selectedAreas={workEnvironment.selectedAreas}
            weekStartDay={workEnvironment.weekStartDay}
            use24Hour={workEnvironment.use24Hour}
            onAddRegion={handleAddRegion}
            onRemoveRegion={handleRemoveRegion}
            onWeekStartDayChange={(day) => {
              const updated = { ...workEnvironment, weekStartDay: day };
              setWorkEnvironment(updated);
              localStorage.setItem("workEnvironment", JSON.stringify(updated));
            }}
            onUse24HourChange={(use) => {
              const updated = { ...workEnvironment, use24Hour: use };
              setWorkEnvironment(updated);
              localStorage.setItem("workEnvironment", JSON.stringify(updated));
            }}
          />
        )}
      </div>

      <RegionSearchModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onSelect={handleRegionSelect}
        koreanRegions={koreanRegions}
      />
    </div>
  );
};

export default Settings;
