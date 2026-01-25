import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { profile, age, address, displayName, updateProfile, updateRegion } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: displayName || "",
    age: age || "",
    address: address || "",
  });

  const [workHistory, setWorkHistory] = useState({
    storeName: "스타벅스 용산점",
    period: "2025.11.03~현재",
    type: "카페",
    mainDuties: "손님 응대, 음료 제조, 매장 청소",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 저장된 데이터 불러오기
  useEffect(() => {
    // useUser에서 가져온 데이터로 초기화
    if (displayName) {
      setProfileData({
        name: displayName,
        age: age || "",
        address: address || "",
      });
    }

    const savedWorkHistory = sessionStorage.getItem("workHistory");
    if (savedWorkHistory) {
      setWorkHistory(JSON.parse(savedWorkHistory));
    }

    const savedProfileImage = sessionStorage.getItem("profileImage");
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, [displayName, age, address]);

  if (!profile) return null;

  // 프로필 사진 마우스 우클릭 시 수정가능하게
  const handleProfileImageContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
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
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 수정하기/수정완료 버튼 클릭 시
  const handleEditToggle = () => {
    if (isEditing) {
      // 수정완료 - 저장하고 편집 모드 종료
      // 닉네임 업데이트
      if (profileData.name !== displayName) {
        updateProfile({ nickname: profileData.name });
      }

      // 주소 업데이트 (형식: "서울 강남구 거주" -> sido: "서울", gugun: "강남구")
      if (profileData.address && profileData.address !== address) {
        const addressParts = profileData.address.replace(" 거주", "").split(" ");
        if (addressParts.length >= 2) {
          updateRegion({
            sido: addressParts[0],
            gugun: addressParts.slice(1).join(" "),
          });
        }
      }

      sessionStorage.setItem("workHistory", JSON.stringify(workHistory));
      if (profileImage) {
        sessionStorage.setItem("profileImage", profileImage);
      }
      setIsEditing(false);
    } else {
      // 수정하기 - 편집 모드로 전환
      setIsEditing(true);
    }
  };

  return (
    <main className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto">
      {/* 내 정보 수정하기 섹션 */}
      <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white mb-6 relative">
        <div className="absolute top-6 right-6">
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all"
          >
            {isEditing ? "수정완료" : "수정하기"}
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6">내 정보 수정하기</h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <img
              src={profileImage || profile.picture}
              alt="profile"
              className="w-32 h-32 rounded-full border-4 border-gray-200 cursor-pointer"
              onContextMenu={handleProfileImageContextMenu}
            />
          </div>
        </div>

        {/* 정보 테이블 */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 border-b border-gray-300">
            <div className="p-4 border-r border-gray-300 bg-gray-50 font-bold text-gray-800">
              이름
            </div>
            <div className="p-4">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800"
                  placeholder="이름을 입력하세요"
                />
              ) : (
                <span className="text-gray-800">{profileData.name}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-300">
            <div className="p-4 border-r border-gray-300 bg-gray-50 font-bold text-gray-800">
              나이
            </div>
            <div className="p-4">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800"
                  placeholder="나이를 입력하세요"
                />
              ) : (
                <span className="text-gray-800">{profileData.age}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="p-4 border-r border-gray-300 bg-gray-50 font-bold text-gray-800">
              주소
            </div>
            <div className="p-4">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-800"
                  placeholder="주소를 입력하세요"
                />
              ) : (
                <span className="text-gray-800">{profileData.address}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 대표 이력 수정하기 섹션 - 클릭해서 사용자가 직접 입력 */}
      <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">대표 이력 수정하기</h2>

        {/* 이력 테이블 */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 border-b border-gray-300">
            <div className="p-4 border-r border-gray-300 bg-gray-50 font-bold text-gray-800">
              매장명
            </div>
            <div className="p-4">
              {isEditing ? (
                <input
                  type="text"
                  value={workHistory.storeName}
                  onChange={(e) => setWorkHistory({ ...workHistory, storeName: e.target.value })}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="매장명을 입력하세요"
                />
              ) : (
                <span className="text-gray-800">{workHistory.storeName}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-300">
            <div className="p-4 border-r border-gray-300 bg-gray-50 font-bold text-gray-800">
              기간
            </div>
            <div className="p-4">
              {isEditing ? (
                <input
                  type="text"
                  value={workHistory.period}
                  onChange={(e) => setWorkHistory({ ...workHistory, period: e.target.value })}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="기간을 입력하세요"
                />
              ) : (
                <span className="text-gray-800">{workHistory.period}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-300">
            <div className="p-4 border-r border-gray-300 bg-gray-50 font-bold text-gray-800">
              타입
            </div>
            <div className="p-4">
              {isEditing ? (
                <input
                  type="text"
                  value={workHistory.type}
                  onChange={(e) => setWorkHistory({ ...workHistory, type: e.target.value })}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="타입을 입력하세요"
                />
              ) : (
                <span className="text-gray-800">{workHistory.type}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="p-4 border-r border-gray-300 bg-gray-50 font-bold text-gray-800">
              주요업무
            </div>
            <div className="p-4">
              {isEditing ? (
                <input
                  type="text"
                  value={workHistory.mainDuties}
                  onChange={(e) => setWorkHistory({ ...workHistory, mainDuties: e.target.value })}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="주요업무를 입력하세요"
                />
              ) : (
                <span className="text-gray-800">{workHistory.mainDuties}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfileEdit;

