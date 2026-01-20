import { useState, useEffect, useCallback } from "react";
import type { Notification, NotificationType } from "../types/notification";

const NOTIFICATIONS_STORAGE_KEY = "notifications";

// 상대 시간 계산 함수
const getRelativeTime = (date: string): string => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now.getTime() - notificationDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins < 1 ? "방금 전" : `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.split("T")[0].replace(/-/g, ".");
  }
};

// 초기 더미 알림 데이터
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "approval",
    title: "11/19 GS25 대타 지원이 승인되었습니다.",
    date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    timestamp: "10시간 전",
    createdAt: Date.now() - 10 * 60 * 60 * 1000,
  },
  {
    id: "2",
    type: "reminder",
    title: "오늘 14:00 CU 출근 알림",
    date: "2025-11-16",
    timestamp: "2025.11.16",
    createdAt: new Date("2025-11-16").getTime(),
  },
  {
    id: "3",
    type: "settlement",
    title: "11/10 정산 완료",
    amount: 44000,
    date: "2025-11-13",
    timestamp: "2025.11.13",
    createdAt: new Date("2025-11-13").getTime(),
  },
  // 추가 더미 데이터 (무한 스크롤 테스트용)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `dummy-${i + 4}`,
    type: ["approval", "reminder", "settlement"][i % 3] as NotificationType,
    title: `알림 ${i + 4}: ${["대타 지원 승인", "출근 알림", "정산 완료"][i % 3]}`,
    amount: i % 3 === 2 ? Math.floor(Math.random() * 50000) + 20000 : undefined,
    date: new Date(Date.now() - (i + 4) * 24 * 60 * 60 * 1000).toISOString(),
    timestamp: `${i + 4}일 전`,
    createdAt: Date.now() - (i + 4) * 24 * 60 * 60 * 1000,
  })),
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // timestamp 업데이트
      const updated = parsed.map((n: Notification) => ({
        ...n,
        timestamp: getRelativeTime(n.date),
      }));
      setNotifications(updated);
    } else {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  }, []);

  // 알림 삭제
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 모든 알림 삭제
  const deleteAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
  }, []);

  // 알림 추가 (예: 지원 승인 시)
  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: getRelativeTime(notification.date),
      createdAt: Date.now(),
    };
    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 정렬된 알림 (최신순)
  const sortedNotifications = notifications.sort((a, b) => b.createdAt - a.createdAt);

  return {
    notifications: sortedNotifications,
    isLoading,
    deleteNotification,
    deleteAllNotifications,
    addNotification,
  };
};

