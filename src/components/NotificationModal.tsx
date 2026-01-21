import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNotifications } from "../hooks/useNotifications";
import type { Notification } from "../types/notification";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 3; // 한 번에 표시할 알림 개수

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, deleteNotification, deleteAllNotifications } = useNotifications();
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const isLoadingMoreRef = useRef(false);

  // 알림 설정 불러오기
  const getNotificationSettings = () => {
    const saved = sessionStorage.getItem("notificationSettings");
    if (saved) {
      return JSON.parse(saved);
    }
    // 기본값: 모두 켜져있음
    return {
      all: true,
      workRelated: true,
      clockInOut: true,
      preWorkStart: true,
      substituteRecommendation: true,
      newCustomJob: true,
      settlementStatus: true,
    };
  };

  // 알림 타입을 설정 카테고리로 매핑
  const getNotificationCategory = (type: string): keyof ReturnType<typeof getNotificationSettings> => {
    switch (type) {
      case "approval":
        return "workRelated";
      case "reminder":
        // reminder는 제목이나 내용에 따라 분류할 수 있지만, 일단 preWorkStart로 매핑
        return "preWorkStart";
      case "settlement":
        return "settlementStatus";
      default:
        return "all";
    }
  };

  // 알림 설정에 따라 필터링된 알림 목록
  const filteredNotifications = React.useMemo(() => {
    const settings = getNotificationSettings();
    
    // 전체 알림이 꺼져있으면 모든 알림 필터링
    if (!settings.all) {
      return [];
    }

    return notifications.filter((notification) => {
      const category = getNotificationCategory(notification.type);
      return settings[category] !== false; // 해당 카테고리의 알림이 켜져있으면 표시
    });
  }, [notifications]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setShowAll(false);
      setDisplayedCount(ITEMS_PER_PAGE);
      setIsAtBottom(false);
    }
  }, [isOpen]);

  // 표시할 알림 목록
  const displayedNotifications = showAll
    ? filteredNotifications.slice(0, displayedCount)
    : filteredNotifications.slice(0, ITEMS_PER_PAGE);

  // 스크롤이 끝에 도달했는지 확인
  const checkScrollBottom = useCallback(() => {
    if (!scrollContainerRef.current || !showAll) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px 여유

    if (isBottom && !isAtBottom) {
      setIsAtBottom(true);
    } else if (!isBottom && isAtBottom) {
      setIsAtBottom(false);
    }
  }, [showAll, isAtBottom]);

  // 무한 스크롤 이벤트 리스너
  useEffect(() => {
    if (!showAll || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    container.addEventListener("scroll", checkScrollBottom);
    checkScrollBottom();

    return () => {
      container.removeEventListener("scroll", checkScrollBottom);
    };
  }, [showAll, displayedCount, checkScrollBottom]);

  // 스크롤이 끝에 도달하면 더 많은 알림 로드
  useEffect(() => {
    if (
      showAll &&
      isAtBottom &&
      displayedCount < notifications.length &&
      !isLoadingMoreRef.current
    ) {
      isLoadingMoreRef.current = true;
      setTimeout(() => {
        setDisplayedCount((prev) => {
          const next = Math.min(prev + ITEMS_PER_PAGE, notifications.length);
          isLoadingMoreRef.current = false;
          return next;
        });
      }, 100);
    }
  }, [isAtBottom, displayedCount, filteredNotifications.length, showAll]);

  // 자세히 보기 클릭
  const handleViewAll = () => {
    setShowAll(true);
    setDisplayedCount(ITEMS_PER_PAGE);
    // 스크롤을 맨 위로
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  // 우클릭 삭제
  const handleContextMenu = (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    if (window.confirm("이 알림을 삭제하시겠습니까?")) {
      deleteNotification(notificationId);
    }
  };

  // 전체 삭제
  const handleDeleteAll = () => {
    if (window.confirm("모든 알림을 삭제하시겠습니까?")) {
      deleteAllNotifications();
      setShowAll(false);
      setDisplayedCount(ITEMS_PER_PAGE);
    }
  };

  // 모든 알림을 다 봤는지 확인
  const hasMoreNotifications = displayedCount < filteredNotifications.length;
  const isAllNotificationsShown =
    showAll && !hasMoreNotifications && filteredNotifications.length > 0;

  if (!isOpen) return null;

  return (
    <div className="absolute right-6 top-14 z-50">
      <div className="bg-white rounded-[35px] w-96 max-h-[calc(100vh-100px)] flex flex-col shadow-2xl border border-gray-200">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-800">알림</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* 알림 목록 */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 300px)" }}
        >
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-400 text-sm font-medium">알림이 없습니다</p>
            </div>
          ) : (
            <div className="p-4">
              {displayedNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onContextMenu={(e) => handleContextMenu(e, notification.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl ${
                    index < displayedNotifications.length - 1 ? "border-b border-gray-200 mb-2" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-black text-gray-800 flex-1 pr-4">
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {notification.timestamp}
                    </span>
                  </div>
                  {notification.amount && (
                    <p className="text-sm font-black text-gray-800 mt-2">
                      {notification.amount.toLocaleString()}원
                    </p>
                  )}
                  {notification.content && (
                    <p className="text-xs text-gray-500 mt-1">{notification.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200">
          {!showAll ? (
            <button
              onClick={handleViewAll}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-black text-sm transition-all"
            >
              자세히 보기
            </button>
          ) : isAllNotificationsShown ? (
            <button
              onClick={handleDeleteAll}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-black text-sm transition-all"
            >
              모든 알림 전체 삭제하기
            </button>
          ) : (
            <div className="text-center text-xs text-gray-400 py-2">
              스크롤하여 더 많은 알림을 확인하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

