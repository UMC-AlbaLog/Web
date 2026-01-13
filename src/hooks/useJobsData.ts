import { useState, useEffect } from "react";
import { findDynamicFreeSlot } from "../utils/scheduleUtils";

export const useJobsData = () => {
  const [userName, setUserName] = useState("혜니");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [freeSlot, setFreeSlot] = useState("일정을 확인 중입니다...");

  useEffect(() => {
    // 유저 정보 로드
    const userData = sessionStorage.getItem("googleUser");
    if (userData) setUserName(JSON.parse(userData).name);

    // 위치 정보 로드
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err.message)
      );
    }

    // 스케줄 데이터 읽기 및 빈 시간 계산
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) {
      const schedules = JSON.parse(savedSchedules);
      setFreeSlot(findDynamicFreeSlot(schedules)); 
    } else {
      setFreeSlot("알바를 등록하고 빈 시간을 확인해보세요!");
    }
  }, []);

  return { userName, userLocation, freeSlot };
};