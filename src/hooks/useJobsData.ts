import { useState, useEffect, useMemo } from "react";
import { useSchedules } from "../contexts/SchedulesContext";
import { findDynamicFreeSlot } from "../utils/scheduleUtils";

export const useJobsData = () => {
  const { schedules } = useSchedules();
  const [userName, setUserName] = useState("회원");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("googleUser");
    if (userData) setUserName(JSON.parse(userData).name);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err.message)
      );
    }
  }, []);

  const freeSlot = useMemo(() => {
    if (!schedules.length) return "알바를 등록하고 빈 시간을 확인해보세요!";
    return findDynamicFreeSlot(schedules);
  }, [schedules]);

  return { userName, userLocation, freeSlot };
};