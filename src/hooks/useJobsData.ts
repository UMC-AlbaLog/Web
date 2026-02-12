import { useState, useEffect, useMemo } from "react";
import { useSchedules } from "../contexts/SchedulesContext";
import { findDynamicFreeSlot } from "../utils/scheduleUtils";
import { userService } from "../api/userService";

export const useJobsData = () => {
  const { schedules } = useSchedules();
  const [nickname, setNickname] = useState("회원");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const signupData = sessionStorage.getItem("signupInfo");
      if (signupData) {
        const parsed = JSON.parse(signupData);
        if (parsed.nickname) {
          setNickname(parsed.nickname);
          return;
        }
      }

      try {
        const userInfo = await userService.getUserInfo();
        if (userInfo && userInfo.nickname) {
          setNickname(userInfo.nickname);
          return;
        }
      } catch (e) {
        console.warn("닉네임 API 로드 실패, 세션 폴백 사용");
      }

      const googleData = sessionStorage.getItem("googleUser");
      if (googleData) {
        const parsed = JSON.parse(googleData);
        setNickname(parsed.nickname || parsed.name || "회원");
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
    return findDynamicFreeSlot(schedules);
  }, [schedules]);

  return { nickname, userLocation, freeSlot };
};