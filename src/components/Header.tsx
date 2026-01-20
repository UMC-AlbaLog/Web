import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationModal from "./NotificationModal";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const user: GoogleUser | null = (() => {
    const data = sessionStorage.getItem("googleUser");
    return data ? JSON.parse(data) : null;
  })();

  if (!user) return null;

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <header className="h-14 bg-white flex justify-end items-center px-6 gap-4 shadow relative z-40">
      {/* 알림 */}
      <div className="relative">
        <button 
          onClick={() => setIsNotificationOpen(true)}
          className="text-sm hover:text-gray-600"
        >
          알림
        </button>

        <NotificationModal 
          isOpen={isNotificationOpen} 
          onClose={() => setIsNotificationOpen(false)} 
        />
      </div>

      {/* 프로필 영역 */}
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm hover:text-gray-600"
        >
          {/* 프로필 사진 */}
          <img
            src={user.picture}
            alt="profile"
            className="w-8 h-8 rounded-full border"
          />

          {/* 이름 (모바일에서는 숨김 가능) */}
          <span className="hidden sm:block font-medium">
            {user.name}
          </span>
        </button>

        {/* 드롭다운 */}
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg p-3 z-50">
            <p className="text-sm font-semibold">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {user.email}
            </p>

            <button
              onClick={handleLogout}
              className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
