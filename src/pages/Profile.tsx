import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

interface Badge {
  id: string;
  name: string;
  achieved: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, age, address, displayName } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([
    { id: "1", name: "주말 대타 5회 달성", achieved: false },
    { id: "2", name: "편의점 최초 근무", achieved: false },
    { id: "3", name: "지각 없이 연속 10회 근무", achieved: false },
  ]);

  // 저장된 대표 이력 불러오기
  const [workHistory, setWorkHistory] = useState(() => {
    const saved = sessionStorage.getItem("workHistory");
    return saved
      ? JSON.parse(saved)
      : {
          storeName: "스타벅스 용산점",
          period: "2025.11.03~현재",
          type: "카페",
          mainDuties: "손님 응대, 음료 제조, 매장 청소",
        };
  });

  // 저장된 프로필 이미지 불러오기
  useEffect(() => {
    const savedImage = sessionStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // sessionStorage 변경 감지 (다른 탭에서 변경되었을 경우)
    const handleStorageChange = () => {
      const savedWorkHistory = sessionStorage.getItem("workHistory");
      if (savedWorkHistory) {
        setWorkHistory(JSON.parse(savedWorkHistory));
      }

      const savedImage = sessionStorage.getItem("profileImage");
      if (savedImage) {
        setProfileImage(savedImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!profile) return null;

  // 프로필 사진 클릭 또는 우클릭 시 수정 가능하게
  const handleProfileImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setProfileImage(result);
          sessionStorage.setItem("profileImage", result);
          console.log("Profile image changed:", result);
          // 실제로는 서버에 업로드
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleProfileImageContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handleProfileImageClick();
  };

  // 활동 배지 클릭 시 달성
  const handleBadgeClick = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((badge) =>
        badge.id === badgeId ? { ...badge, achieved: !badge.achieved } : badge
      )
    );
  };

  const handleViewReviews = () => {
    navigate("/profile/reviews");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  return (
    <main className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto">
        {/* 내 정보 섹션 제목 */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">내 정보</h2>

        {/* 내 정보 카드 */}
        <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white mb-6 relative">
          <div className="flex items-center gap-6">
            {/* 프로필 사진 */}
            <div
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer relative"
              onClick={handleProfileImageClick}
              onContextMenu={handleProfileImageContextMenu}
            >
              <img
                src={profileImage || profile.picture}
                alt="profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
            {/* 프로필 정보 */}
            <div className="flex-1">
              <div className="space-y-2">
                <div>
                  <span className="text-2xl font-black text-gray-800">{displayName}</span>
                </div>
                {age && <p className="text-lg font-bold text-gray-600">{age}</p>}
                {address && <p className="text-sm font-bold text-gray-500">{address}</p>}
              </div>
            </div>
          </div>
          {/* 오른쪽 상단 버튼들 */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={handleViewReviews}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all"
            >
              내 리뷰 모아보기
            </button>
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all"
            >
              정보수정
            </button>
          </div>
        </div>

        {/* 2열 레이아웃 - 대칭 맞춤 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 왼쪽 열 */}
          <div className="flex flex-col gap-6">
            {/* 신뢰 지표 */}
            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white flex flex-col h-full">
              <h3 className="text-xl font-black text-gray-800 mb-4">신뢰 지표</h3>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl font-black text-gray-800">4.8</div>
                <div className="text-3xl font-black text-gray-400">/5.0</div>
                <svg
                  className="w-12 h-12 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-600 mb-4">(사장님 평가)</p>
              <div className="space-y-2 grow">
                <p className="text-sm font-bold text-gray-700">
                  지각 0회 * 결근 0회
                </p>
                <p className="text-sm font-bold text-gray-700">
                  성실도 상위 10%입니다.
                </p>
              </div>
            </div>

            {/* 활동 배지 */}
            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white flex flex-col h-full">
              <h3 className="text-xl font-black text-gray-800 mb-4">활동 배지</h3>
              <div className="space-y-3 grow">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-all"
                    onClick={() => handleBadgeClick(badge.id)}
                  >
                    <input
                      type="checkbox"
                      checked={badge.achieved}
                      onChange={() => handleBadgeClick(badge.id)}
                      className="w-5 h-5 border-gray-300 rounded cursor-pointer"
                    />
                    <span
                      className={`text-sm font-medium ${
                        badge.achieved ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 열 */}
          <div className="flex flex-col gap-6">
            {/* 알바 경험 이력 */}
            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white flex flex-col h-full">
              <h3 className="text-xl font-black text-gray-800 mb-4">알바 경험 이력</h3>
              <p className="text-sm font-bold text-gray-600 mb-4">2025.11.03~2025.11.19</p>
              <div className="space-y-2 grow">
                <p className="text-sm font-bold text-gray-700">근무횟수: 25회</p>
                <p className="text-sm font-bold text-gray-700">주로 했던 알바: 메가커피</p>
                <p className="text-sm font-bold text-gray-700">자주 나간 타입: 카페</p>
              </div>
            </div>

            {/* 대표 이력 */}
            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white flex flex-col h-full">
              <h3 className="text-xl font-black text-gray-800 mb-4">대표 이력</h3>
              <div className="space-y-2 grow">
                <p className="text-lg font-black text-gray-800">{workHistory.storeName}</p>
                <p className="text-sm font-bold text-gray-700">기간: {workHistory.period}</p>
                <p className="text-sm font-bold text-gray-700">타입: {workHistory.type}</p>
                <p className="text-sm font-bold text-gray-700">
                  주요 업무/역할: {workHistory.mainDuties}
                </p>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
};

export default Profile;
