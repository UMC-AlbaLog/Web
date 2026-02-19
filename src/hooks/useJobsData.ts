import { useState, useEffect, useMemo } from "react";
import { useSchedules } from "../contexts/SchedulesContext";
import { findDynamicFreeSlot } from "../utils/scheduleUtils";
import { getProfile } from "../api/profile";

export const useJobsData = () => {
  const { schedules } = useSchedules();
  const [username, setUsername] = useState("회원");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profile = await getProfile();
        if (profile && profile.userName) {
          setUsername(profile.userName);
        }
      } catch (e) {
        console.warn("프로필 로드 실패, 세션 폴백 사용");
        const googleData = sessionStorage.getItem("googleUser");
        if (googleData) {
          const parsed = JSON.parse(googleData);
          setUsername(parsed.name || "회원");
        }
      }
    };

    fetchUserData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err.message)
      );
    }
  }, []);

  const freeSlot = useMemo(() => {
    if (!schedules || schedules.length === 0) return "알바를 등록하고 빈 시간을 확인해보세요!";
    
    const formattedSchedules = schedules.map((s: any) => ({
      id: s.workLogId || s.id || Math.random().toString(),
      workplaceId: s.storeId || s.id || "temp-id",
      date: s.workDate || s.date,
      startTime: (s.startTime || "00:00").slice(0, 5),
      endTime: (s.endTime || "00:00").slice(0, 5)
    }));

    return findDynamicFreeSlot(formattedSchedules as any);
  }, [schedules]);

  return { username, userLocation, freeSlot };
};