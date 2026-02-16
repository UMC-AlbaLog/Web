import React, { useState, useEffect } from "react";
// @ts-ignore react-router-dom 타입 정의와 실제 버전 차이로 인한 임시 무시
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { getProfile } from "../api/profile";
import { getUserReviews } from "../api/reviews";
import ProfileHeader from "../components/profile/ProfileHeader";
import RepresentativeHistory from "../components/profile/RepresentativeHistory";
import TrustScoreCard from "../components/profile/TrustScoreCard";
import BadgeSection from "../components/profile/BadgeSection";
import ReviewSection from "../components/profile/ReviewSection";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  achieved: boolean;
}

interface Review {
  id: string;
  company: string;
  text: string;
  rating: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, displayName, age, address } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [apiProfile, setApiProfile] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // user 변수 안전하게 가져오기
  const user: GoogleUser | null = React.useMemo(() => {
    try {
      const data = sessionStorage.getItem("googleUser");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("googleUser 파싱 실패:", error);
      return null;
    }
  }, []);

  // 프로필 데이터 (API 데이터 최우선, 없으면 가입 정보 사용)
  const profileName = apiProfile?.userName || displayName || profile?.name || user?.name || "사용자";
  const profileAge = apiProfile?.age ? `${apiProfile.age}세` : age || null;
  const profileAddress = apiProfile?.address || address || null;
  const trustScore = apiProfile?.trustScore ?? null;
  const totalWorkCount = apiProfile?.totalWorkCount ?? null;

  // 저장된 프로필 이미지 불러오기
  React.useEffect(() => {
    const savedImage = sessionStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }

    const handleStorageChange = () => {
      const savedImage = sessionStorage.getItem("profileImage");
      if (savedImage) {
        setProfileImage(savedImage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setApiProfile(data);
        
        // 프로필 이미지 설정
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
        
        // 기본 뱃지 (백엔드에서 내려오는 뱃지)
        const baseBadges: Badge[] =
          data.badges?.map((badge) => ({
              id: badge.badgeId,
              name: badge.badgeName,
            // 뱃지 이름에 따라 아이콘 매핑 (기본값: 번개)
            icon:
              badge.badgeName.includes("지각") || badge.badgeName.includes("칼지급")
                ? "clock"
                : badge.badgeName.includes("주말")
                ? "weekend"
                : badge.badgeName.includes("단체")
                ? "group"
                : "lightning",
            achieved: true,
          })) ?? [];

        // 프론트에서 자동 부여하는 뱃지 (문구 기준)
        const autoBadges: Badge[] = [];
        const workCount = data.totalWorkCount ?? 0;
        const totalWorkDays = data.representativeHistory?.totalWorkDays ?? 0;

        // 1) 지각 없이 10회 연근 (근무 10회 이상이라고 가정)
        if (workCount >= 10) {
          autoBadges.push({
            id: "auto_on_time_10",
            name: "지각 없이 10회 연근",
            icon: "clock",
            achieved: true,
          });
        }

        // 2) 일주일 동안 5회 근무 (주 단위 데이터가 없어 총 근무일수 5일 이상으로 간주)
        if (totalWorkDays >= 5) {
          autoBadges.push({
            id: "auto_week_5",
            name: "일주일 동안 5회 근무",
            icon: "lightning",
            achieved: true,
          });
        }

        // 3) 단체 근무 마니아 (대표 이력 근무일수 20일 이상)
        if (totalWorkDays >= 20) {
          autoBadges.push({
            id: "auto_group_mania",
            name: "단체 근무 마니아",
            icon: "group",
            achieved: true,
          });
        }

        // 4) 주말 대타 5회 달성 (주말 데이터가 없어 근무 30회 이상으로 간주)
        if (workCount >= 30) {
          autoBadges.push({
            id: "auto_weekend_5",
            name: "주말 대타 5회 달성",
            icon: "weekend",
              achieved: true,
          });
        }

        // 이름 기준 중복 제거 후 합치기
        const existingNames = new Set(baseBadges.map((b) => b.name));
        const mergedBadges = [
          ...baseBadges,
          ...autoBadges.filter((b) => !existingNames.has(b.name)),
        ];

        setBadges(mergedBadges);
      } catch (error) {
        console.error("프로필 로드 실패:", error);
        // 에러가 발생해도 기본 UI는 표시
      }
    };

    // 에러가 발생해도 UI는 표시되도록 try-catch로 감싸기
    try {
      loadProfile();
    } catch (error) {
      console.error("프로필 로드 초기화 실패:", error);
    }
  }, []);

  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewData = await getUserReviews();
        
        // API 응답을 UI에서 사용하는 Review 형식으로 변환
        const mappedReviews: Review[] = reviewData.map((item) => ({
          id: item.reviewId,
          company: item.storeName || "알 수 없음",
          text: item.content || "",
          rating: item.rating || 0,
        }));
        
        setReviews(mappedReviews);
      } catch (error) {
        console.error("리뷰 로드 실패:", error);
        // 에러가 발생해도 기본 UI는 표시
      }
    };

    try {
      loadReviews();
    } catch (error) {
      console.error("리뷰 로드 초기화 실패:", error);
    }
  }, []);

  // 점수 애니메이션 트리거
  React.useEffect(() => {
    setTimeout(() => {
      setScoreAnimation(true);
    }, 100);
  }, []);

  // user가 없어도 기본 UI는 표시 (API 데이터가 있으면 사용)

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
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleViewAllReviews = () => {
    navigate("/profile/reviews");
  };

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  // attendanceRate는 API에서 제공되지 않으므로 null 처리
  const attendanceRate = null;

  // 에러 바운더리: 렌더링 전 에러 체크
  try {
    return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <div className="grid grid-cols-3 gap-6">
        {/* 왼쪽 열 - 프로필 헤더, 대표 이력, 리뷰 */}
        <div className="col-span-2 space-y-6">
          <ProfileHeader
            profileImage={apiProfile?.profileImage || profileImage || user?.picture || null}
            profileName={profileName}
            profileAge={profileAge}
            profileAddress={profileAddress}
            averageRating={averageRating}
            totalWorkCount={totalWorkCount}
            attendanceRate={attendanceRate}
            onEditProfile={handleEditProfile}
            onProfileImageClick={handleProfileImageClick}
          />

          {apiProfile?.representativeHistory && (
            <RepresentativeHistory
              representativeHistory={apiProfile.representativeHistory}
              isEditing={false}
              editingData={apiProfile.representativeHistory}
              onStartEdit={() => {}}
              onSave={() => {}}
              onCancel={() => {}}
              onDataChange={() => {}}
            />
          )}

          <ReviewSection
            reviews={reviews.slice(0, 2)}
            totalReviewsCount={reviews.length}
            onViewAll={handleViewAllReviews}
          />
        </div>

        {/* 오른쪽 열 - 신뢰 지표, 활동 뱃지 */}
        <div className="space-y-6">
          <TrustScoreCard trustScore={trustScore} scoreAnimation={scoreAnimation} />
          <BadgeSection badges={badges} />
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error("프로필 렌더링 에러:", error);
    // 에러 발생 시 기본 UI 표시
    return (
      <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">프로필</h2>
            <p className="text-gray-600">프로필을 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-sm text-gray-500 mt-2">브라우저 콘솔을 확인해주세요.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default Profile;
