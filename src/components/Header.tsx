import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationModal from "./NotificationModal";
import { getProfile } from "../api/profile";
import type { ProfileData } from "../api/profile";
 // 경로 맞게 수정

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [open, setOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const userId = sessionStorage.getItem("userId");

  /* ============================= */
  /* 프로필 API 호출 */
  /* ============================= */
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const data = await getProfile(userId);
        setProfile(data);
      } catch (err) {
        console.error("프로필 불러오기 실패:", err);
      }
    };

    fetchProfile();
  }, [userId]);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/profile")) return "프로필";
    if (location.pathname === "/settings") return "설정";
    return null;
  };

  const pageTitle = getPageTitle();

  const name = profile?.userName ?? "UMC";
  const image =
    profile?.profileImage ?? "https://placehold.co/40x40";

  return (
    <header className="h-16 bg-white rounded-bl-3xl shadow flex justify-between items-center px-4 gap-4 relative z-40">
      {pageTitle && (
        <h1 className="text-xl font-bold text-gray-800">
          {pageTitle}
        </h1>
      )}

      <div className="flex items-center gap-6 ml-auto">
        {/* 알림 버튼 */}
        <button
          type="button"
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 text-gray-500 hover:text-gray-700"
        >
          🔔
        </button>

        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />

        {/* 프로필 */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3"
        >
          <img
            src={image}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col text-left">
            <span className="text-gray-900 font-semibold">
              {name}
            </span>
            <span className="text-gray-500 text-xs">
              프로알바러
            </span>
          </div>
        </button>
      </div>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-4 top-full mt-2 w-56 bg-white border rounded-xl shadow-lg p-3 z-50">
          <p className="text-sm font-semibold text-gray-800">
            {name}
          </p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.clear();
              navigate("/", { replace: true });
            }}
            className="w-full text-left text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
