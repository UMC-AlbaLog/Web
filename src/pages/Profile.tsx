import React, { useState, useEffect } from "react";
// @ts-ignore react-router-dom 타입 정의와 실제 버전 차이로 인한 임시 무시
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { getProfile } from "../api/profile";
import { getUserReviews } from "../api/reviews";
import { getUserIdFromToken } from "../utils/userId";
import ProfileHeader from "../components/profile/ProfileHeader";
import RepresentativeHistory from "../components/profile/RepresentativeHistory";
import TrustScoreCard from "../components/profile/TrustScoreCard";
import BadgeSection from "../components/profile/BadgeSection";
import CertificationSection from "../components/profile/CertificationSection";
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

interface WorkExperience {
  id: string;
  company: string;
  location: string;
  period: string;
  skills: string[];
  icon: string;
}

interface Review {
  id: string;
  company: string;
  text: string;
  rating: number;
}

interface Certification {
  id: string;
  name: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, displayName, age, address } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [apiProfile, setApiProfile] = useState<any>(null);
  
  const [badges, setBadges] = useState<Badge[]>([
    { id: "1", name: "지각 없이 10회 연근", icon: "clock", achieved: true },
    { id: "2", name: "일주일 동안 5회 근무", icon: "lightning", achieved: true },
    { id: "3", name: "단체 근무 마니아", icon: "group", achieved: true },
    { id: "4", name: "주말 대타 5회 달성", icon: "weekend", achieved: true },
  ]);

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      id: "1",
      company: "스타벅스 용산점",
      location: "Starbucks Coffee - Downtown",
      period: "Mar 2021 - Present",
      skills: ["음료 제조", "손님 응대", "포스기 사용"],
      icon: "coffee",
    },
    {
      id: "2",
      company: "서가앤쿡 인하대",
      location: "The Plate Restaurant",
      period: "Jan 2019 - Feb 2021",
      skills: ["테이블 서비스", "포스기 사용"],
      icon: "restaurant",
    },
  ]);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [certifications, setCertifications] = useState<Certification[]>([
    { id: "1", name: "바리스타 자격증" },
    { id: "2", name: "CPR 자격증" },
  ]);

  // 모달 상태
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [newExperience, setNewExperience] = useState({
    company: "",
    location: "",
    period: "",
    skills: [] as string[],
    skillInput: "",
  });
  const [newCertification, setNewCertification] = useState({ name: "" });

  // 편집 상태
  const [isEditingRepresentativeHistory, setIsEditingRepresentativeHistory] = useState(false);
  const [editingRepresentativeHistory, setEditingRepresentativeHistory] = useState({
    storeName: "",
    workPeriod: "",
    totalWorkDays: 0,
  });
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingSkillInput, setEditingSkillInput] = useState("");

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

  // 프로필 데이터 (API 데이터 최우선, 없으면 가입 정보 사용, 테스트 데이터 제거)
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
        const userId = getUserIdFromToken();
        if (!userId) {
          console.warn("userId를 찾을 수 없습니다. 기본 프로필 정보를 표시합니다.");
          return;
        }
        const data = await getProfile(userId);
        setApiProfile(data);
        
        // 프로필 이미지 설정
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
        
        // 뱃지 데이터 설정
        if (data.badges && data.badges.length > 0) {
          setBadges(
            data.badges.map((badge: any) => ({
              id: badge.badgeId,
              name: badge.badgeName,
              icon: "clock", // 기본 아이콘
              achieved: true,
            }))
          );
        }
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
        const userId = getUserIdFromToken();
        if (!userId) {
          console.warn("userId를 찾을 수 없습니다. 리뷰를 불러올 수 없습니다.");
          return;
        }

        const reviewData = await getUserReviews(userId);
        
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

  // 알바 경험 이력 추가
  const handleAddExperience = () => {
    setShowExperienceModal(true);
  };

  const handleSaveExperience = () => {
    if (newExperience.company && newExperience.location && newExperience.period) {
      const experience: WorkExperience = {
        id: Date.now().toString(),
        company: newExperience.company,
        location: newExperience.location,
        period: newExperience.period,
        skills: newExperience.skills,
        icon: "coffee",
      };
      setWorkExperiences([...workExperiences, experience]);
      setNewExperience({ company: "", location: "", period: "", skills: [], skillInput: "" });
      setShowExperienceModal(false);
    }
  };

  const handleAddSkill = () => {
    if (newExperience.skillInput.trim()) {
      setNewExperience({
        ...newExperience,
        skills: [...newExperience.skills, newExperience.skillInput.trim()],
        skillInput: "",
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setNewExperience({
      ...newExperience,
      skills: newExperience.skills.filter((_, i) => i !== index),
    });
  };

  const handleDeleteExperience = (id: string) => {
    setWorkExperiences(workExperiences.filter((exp) => exp.id !== id));
  };

  // 대표이력 편집 시작
  const handleStartEditRepresentativeHistory = () => {
    if (apiProfile?.representativeHistory) {
      setEditingRepresentativeHistory({
        storeName: apiProfile.representativeHistory.storeName || "",
        workPeriod: apiProfile.representativeHistory.workPeriod || "",
        totalWorkDays: apiProfile.representativeHistory.totalWorkDays || 0,
      });
      setIsEditingRepresentativeHistory(true);
    }
  };

  // 대표이력 편집 취소
  const handleCancelEditRepresentativeHistory = () => {
    setIsEditingRepresentativeHistory(false);
    setEditingRepresentativeHistory({
      storeName: "",
      workPeriod: "",
      totalWorkDays: 0,
    });
  };

  // 대표이력 저장
  const handleSaveRepresentativeHistory = () => {
    // TODO: API 호출로 저장
    if (apiProfile) {
      setApiProfile({
        ...apiProfile,
        representativeHistory: {
          storeName: editingRepresentativeHistory.storeName,
          workPeriod: editingRepresentativeHistory.workPeriod,
          totalWorkDays: editingRepresentativeHistory.totalWorkDays,
        },
      });
    }
    setIsEditingRepresentativeHistory(false);
    alert("대표이력이 저장되었습니다.");
  };

  // 알바 경험 이력 편집 시작
  const handleStartEditExperience = (exp: WorkExperience) => {
    setEditingExperienceId(exp.id);
    setEditingExperience({ ...exp });
    setEditingSkillInput("");
  };

  // 알바 경험 이력 편집 취소
  const handleCancelEditExperience = () => {
    setEditingExperienceId(null);
    setEditingExperience(null);
    setEditingSkillInput("");
  };

  // 알바 경험 이력 편집 저장
  const handleSaveEditedExperience = () => {
    if (editingExperience && editingExperienceId) {
      setWorkExperiences(
        workExperiences.map((exp) =>
          exp.id === editingExperienceId ? editingExperience : exp
        )
      );
      setEditingExperienceId(null);
      setEditingExperience(null);
      setEditingSkillInput("");
      alert("경험 이력이 저장되었습니다.");
    }
  };

  // 자격증 추가
  const handleAddCertification = () => {
    setShowCertificationModal(true);
  };

  const handleSaveCertification = () => {
    if (newCertification.name.trim()) {
      const certification: Certification = {
        id: Date.now().toString(),
        name: newCertification.name.trim(),
      };
      setCertifications([...certifications, certification]);
      setNewCertification({ name: "" });
      setShowCertificationModal(false);
    }
  };

  const handleDeleteCertification = (id: string) => {
    setCertifications(certifications.filter((cert) => cert.id !== id));
  };

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  // attendanceRate는 API에서 제공되지 않으므로 null 처리 (테스트 데이터 제거)
  const attendanceRate = null;

  // 에러 바운더리: 렌더링 전 에러 체크
  try {
    return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <div className="grid grid-cols-3 gap-6">
        {/* 왼쪽 열 - 프로필 헤더, 경험 이력, 리뷰 */}
        <div className="col-span-2 space-y-6">
          <ProfileHeader
            profileImage={profileImage || user?.picture || apiProfile?.profileImage || null}
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
              isEditing={isEditingRepresentativeHistory}
              editingData={editingRepresentativeHistory}
              onStartEdit={handleStartEditRepresentativeHistory}
              onSave={handleSaveRepresentativeHistory}
              onCancel={handleCancelEditRepresentativeHistory}
              onDataChange={(data) => setEditingRepresentativeHistory({ ...editingRepresentativeHistory, ...data })}
            />
          )}

          {/* 알바 경험 이력 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-800">알바 경험 이력</h3>
              </div>
              <button
                onClick={handleAddExperience}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + 추가하기
              </button>
            </div>
            <div className="space-y-0">
              {workExperiences.map((exp, index) => (
              <div key={exp.id} className={`transition-all duration-300 ${editingExperienceId === exp.id ? 'border-2 border-blue-300 bg-linear-to-br from-blue-50 via-white to-blue-50 shadow-xl rounded-xl p-6' : 'border-b border-gray-200 bg-white'} ${index === 0 ? 'rounded-t-lg' : ''} ${index === workExperiences.length - 1 && editingExperienceId !== exp.id ? 'rounded-b-lg' : ''}`}>
                  {editingExperienceId === exp.id && editingExperience ? (
                    <div className="p-6 space-y-5">
                      <div className="relative">
                        <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          회사명
                        </label>
                        <input
                          type="text"
                          value={editingExperience.company}
                          onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                          placeholder="회사명을 입력하세요"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          위치
                        </label>
                        <input
                          type="text"
                          value={editingExperience.location}
                          onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                          placeholder="위치를 입력하세요"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          기간
                        </label>
                        <input
                          type="text"
                          value={editingExperience.period}
                          onChange={(e) => setEditingExperience({ ...editingExperience, period: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                          placeholder="예: Mar 2021 - Present"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          스킬
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 bg-gray-50 rounded-xl border border-gray-200">
                          {editingExperience.skills.length > 0 ? (
                            editingExperience.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                              >
                                {skill}
                                <button
                                  onClick={() => {
                                    setEditingExperience({
                                      ...editingExperience,
                                      skills: editingExperience.skills.filter((_, i) => i !== index),
                                    });
                                  }}
                                  className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                  title="삭제"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">스킬을 추가해주세요</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingSkillInput}
                            onChange={(e) => setEditingSkillInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && editingSkillInput.trim()) {
                                e.preventDefault();
                                setEditingExperience({
                                  ...editingExperience,
                                  skills: [...editingExperience.skills, editingSkillInput.trim()],
                                });
                                setEditingSkillInput("");
                              }
                            }}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                            placeholder="스킬 입력 후 Enter 또는 추가 버튼 클릭"
                          />
                          <button
                            onClick={() => {
                              if (editingSkillInput.trim()) {
                                setEditingExperience({
                                  ...editingExperience,
                                  skills: [...editingExperience.skills, editingSkillInput.trim()],
                                });
                                setEditingSkillInput("");
                              }
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            추가
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-gray-200">
                        <button
                          onClick={handleSaveEditedExperience}
                          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            저장
                          </span>
                        </button>
                        <button
                          onClick={handleCancelEditExperience}
                          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    {exp.icon === "coffee" ? (
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232 1.232 3.228 0 4.46s-3.228 1.232-4.46 0L14.5 19.8m-9 0l-1.402 1.402c-1.232 1.232-1.232 3.228 0 4.46s3.228 1.232 4.46 0L9.5 19.8" />
                      </svg>
                    ) : (
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1 text-base">{exp.company}</h4>
                            <p className="text-sm text-gray-600">{exp.location}</p>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-nowrap">{exp.period}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {exp.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleStartEditExperience(exp)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            수정
                          </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                            삭제
                      </button>
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <ReviewSection
            reviews={reviews.slice(0, 2)}
            totalReviewsCount={reviews.length}
            onViewAll={handleViewAllReviews}
          />
        </div>

        {/* 오른쪽 열 - 신뢰 지표, 활동 뱃지, 자격증 */}
        <div className="space-y-6">
          <TrustScoreCard trustScore={trustScore} scoreAnimation={scoreAnimation} />
          <BadgeSection badges={badges} />
          <CertificationSection
            certifications={certifications}
            onAdd={handleAddCertification}
            onDelete={handleDeleteCertification}
          />
        </div>
      </div>

      {/* 알바 경험 이력 추가 모달 */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">알바 경험 이력 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 스타벅스 용산점"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                <input
                  type="text"
                  value={newExperience.location}
                  onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Starbucks Coffee - Downtown"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                <input
                  type="text"
                  value={newExperience.period}
                  onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Mar 2021 - Present"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">스킬</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newExperience.skillInput}
                    onChange={(e) => setNewExperience({ ...newExperience, skillInput: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="스킬 입력 후 Enter"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newExperience.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowExperienceModal(false);
                  setNewExperience({ company: "", location: "", period: "", skills: [], skillInput: "" });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveExperience}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 자격증 추가 모달 */}
      {showCertificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">자격증 추가</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">자격증명</label>
              <input
                type="text"
                value={newCertification.name}
                onChange={(e) => setNewCertification({ name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 바리스타 자격증"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSaveCertification();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCertificationModal(false);
                  setNewCertification({ name: "" });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveCertification}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
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
