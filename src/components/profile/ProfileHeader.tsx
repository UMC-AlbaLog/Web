import React from "react";

interface ProfileHeaderProps {
  profileImage: string | null;
  profileName: string;
  profileAge: string | null;
  profileAddress: string | null;
  averageRating: number;
  totalWorkCount: number | null;
  attendanceRate: number | null;
  onEditProfile: () => void;
  onProfileImageClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileImage,
  profileName,
  profileAge,
  profileAddress,
  averageRating,
  totalWorkCount,
  attendanceRate,
  onEditProfile,
  onProfileImageClick,
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="relative bg-gradient-to-r from-purple-400 via-purple-500 to-blue-600 h-36">
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="relative">
            <img
              src={profileImage || "/default-avatar.png"}
              alt="profile"
              onClick={onProfileImageClick}
              className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg cursor-pointer"
            />
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 border-3 border-white rounded-full shadow-md"></div>
          </div>
        </div>
      </div>
      <div className="pt-20 pb-6 px-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{profileName}</h2>
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium">
              {profileAge && profileAddress ? `${profileAge} / ${profileAddress}` : profileAge || profileAddress || "정보 없음"}
            </p>
          </div>
          <button
            onClick={onEditProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            프로필 수정
          </button>
        </div>
        <div className="flex items-center border-t border-gray-200 pt-6">
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-600 font-medium">평점</p>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalWorkCount ?? "-"}</p>
            <p className="text-sm text-gray-600 font-medium">해낸 알바들</p>
          </div>
          {attendanceRate !== null && (
            <>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{attendanceRate}%</p>
                <p className="text-sm text-gray-600 font-medium">출석률</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

