import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationModal from "./NotificationModal";
import { useUser } from "../hooks/useUser";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, displayName } = useUser();
  const [open, setOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/profile")) return "프로필";
    if (location.pathname === "/settings") return "설정";
    return null;
  };

  const pageTitle = getPageTitle();
  const name = displayName || profile?.name || "유엠씨";

  return (
    <header className="h-16 bg-white rounded-bl-3xl shadow-[-4px_4px_11px_0px_rgba(0,0,0,0.10)] flex justify-between items-center px-4 gap-4 relative z-40">
      {pageTitle && (
        <h1 className="text-xl font-bold text-gray-800 font-['Pretendard']">{pageTitle}</h1>
      )}

      <div className="flex items-center gap-6 ml-auto">
        {/* 알림 (빨간 뱃지) */}
        <button
          type="button"
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 text-gray-500 hover:text-gray-700"
          aria-label="알림"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />

        {/* 프로필 + 이름 + 프로알바러 */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3"
        >
          <img
            src={profile?.picture ?? "https://placehold.co/40x40"}
            alt="profile"
            className="w-10 h-10 rounded-[20px] object-cover shrink-0"
          />
          <div className="inline-flex flex-col justify-center items-start gap-0.5 text-left">
            <span className="text-gray-900 text-base font-semibold font-['Pretendard']">
              {name}
            </span>
            <span className="text-gray-500 text-xs font-normal font-['Pretendard']">
              프로알바러
            </span>
          </div>
        </button>

        {/* 케밥 메뉴 (3점) */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="p-2 text-gray-500 hover:text-gray-700"
          aria-label="메뉴"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
            <span className="w-0.5 h-0.5 rounded-full bg-gray-500" />
            <span className="w-0.5 h-0.5 rounded-full bg-gray-500" />
            <span className="w-0.5 h-0.5 rounded-full bg-gray-500" />
          </div>
        </button>
      </div>

      {open && (
        <div className="absolute right-4 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50">
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <p className="text-xs text-gray-500 mb-3 truncate">{profile?.email}</p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.clear();
              navigate("/", { replace: true });
            }}
            className="w-full text-left text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-['Pretendard']"
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
