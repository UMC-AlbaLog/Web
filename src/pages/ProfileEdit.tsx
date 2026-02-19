import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { getProfile, updateProfile as updateProfileApi } from "../api/profile";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

interface WorkExperience {
  id: string;
  company: string;
  location: string;
  period: string;
  skills: string[];
}

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { profile, displayName, age, address, updateProfile } = useUser();
  // ProfileEdit component
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiProfile, setApiProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    age: "",
    gender: "",
    address: "",
    phone: "",
    introduction: "",
  });

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingSkillInput, setEditingSkillInput] = useState("");

  const user: GoogleUser | null = (() => {
    const data = sessionStorage.getItem("googleUser");
    return data ? JSON.parse(data) : null;
  })();

  // 초기 데이터 로드 (API에서 프로필 정보 가져오기)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getProfile();
        setApiProfile(data);

        // 프로필 이미지 설정
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        } else {
          const savedProfileImage = sessionStorage.getItem("profileImage");
          if (savedProfileImage) {
            setProfileImage(savedProfileImage);
          }
        }

        // 이름 분리 (전체 이름을 성과 이름으로 분리)
        const fullName = data.userName || displayName || profile?.name || "";
        const nameParts = fullName.split(" ");
        const lastName = nameParts.length > 1 ? nameParts[0] : "";
        const firstName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : fullName;

        // 성별 변환 (male/female -> M/F)
        const genderMap: Record<string, string> = {
          male: "M",
          female: "F",
        };

        setFormData({
          lastName,
          firstName,
          age: data.age ? `${data.age}` : age || "",
          gender: genderMap[data.gender] || profile?.gender || "",
          address: data.address || address || "",
          phone: "",
          introduction: "",
        });
      } catch (error) {
        console.error("프로필 로드 실패:", error);
        // 에러 발생 시 기존 로직 사용
        const savedProfileImage = sessionStorage.getItem("profileImage");
        if (savedProfileImage) {
          setProfileImage(savedProfileImage);
        }

        if (profile) {
          const fullName = displayName || profile.name || "";
          const nameParts = fullName.split(" ");
          const lastName = nameParts.length > 1 ? nameParts[0] : "";
          const firstName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : fullName;

          setFormData({
            lastName,
            firstName,
            age: age || "",
            gender: profile.gender || "",
            address: address || "",
            phone: "",
            introduction: "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profile, displayName, age, address]);

  if (!user) return null;

  // 프로필 사진 변경
  const handleProfileImageChange = () => {
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

  // 프로필 사진 삭제
  const handleProfileImageDelete = () => {
    setProfileImage(null);
    sessionStorage.removeItem("profileImage");
  };

  // 저장하기
  const handleSave = async () => {
    try {
      setIsLoading(true);
      const fullName = `${formData.lastName} ${formData.firstName}`.trim();
      
      // 성별 변환 (M/F -> male/female)
      const genderMap: Record<string, "male" | "female"> = {
        M: "male",
        F: "female",
      };

      // 생년월일 가져오기 (기존 프로필 또는 API 프로필에서)
      const userBirth = apiProfile?.userBirth || profile?.birth || "";

      await updateProfileApi({
        userName: fullName,
        userBirth: userBirth,
        gender: genderMap[formData.gender] || "male",
        profileImage: profileImage || "",
      });

      // 로컬 스토리지에도 저장 (기존 호환성 유지)
      if (profile) {
        updateProfile({
          nickname: fullName,
          birth: profile.birth,
          gender: formData.gender as "M" | "F",
        });
      }

      // sessionStorage에도 저장 (기존 호환성 유지)
      sessionStorage.setItem("profileData", JSON.stringify({
        name: fullName,
        age: formData.age,
        address: formData.address,
      }));

      // 프로필 이미지 저장
      if (profileImage) {
        sessionStorage.setItem("profileImage", profileImage);
      }

      alert("프로필이 성공적으로 수정되었습니다.");
      navigate("/profile");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert(error instanceof Error ? error.message : "프로필 수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    navigate("/profile");
  };

  // 이력 추가
  const handleAddExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      location: "",
      period: "",
      skills: [],
    };
    setWorkExperiences([...workExperiences, newExperience]);
    setEditingExperienceId(newExperience.id);
    setEditingExperience({ ...newExperience });
    setEditingSkillInput("");
  };

  // 이력 수정 시작
  const handleStartEditExperience = (exp: WorkExperience) => {
    setEditingExperienceId(exp.id);
    setEditingExperience({ ...exp });
    setEditingSkillInput("");
  };

  // 이력 수정 취소
  const handleCancelEditExperience = () => {
    setEditingExperienceId(null);
    setEditingExperience(null);
    setEditingSkillInput("");
  };

  // 이력 저장
  const handleSaveExperience = () => {
    if (!editingExperience) return;
    
    if (!editingExperience.company || !editingExperience.location || !editingExperience.period) {
      alert("회사명, 위치, 기간을 모두 입력해주세요.");
      return;
    }

    setWorkExperiences(workExperiences.map((exp) =>
      exp.id === editingExperienceId ? editingExperience : exp
    ));
    setEditingExperienceId(null);
    setEditingExperience(null);
    setEditingSkillInput("");
  };

  // 스킬 추가
  const handleAddSkill = () => {
    if (!editingExperience || !editingSkillInput.trim()) return;
    
    setEditingExperience({
      ...editingExperience,
      skills: [...editingExperience.skills, editingSkillInput.trim()],
    });
    setEditingSkillInput("");
  };

  // 스킬 삭제
  const handleRemoveSkill = (index: number) => {
    if (!editingExperience) return;
    
    setEditingExperience({
      ...editingExperience,
      skills: editingExperience.skills.filter((_, i) => i !== index),
    });
  };

  // 이력 삭제
  const handleDeleteExperience = (id: string) => {
    if (window.confirm("이 이력을 삭제하시겠습니까?")) {
    setWorkExperiences(workExperiences.filter((exp) => exp.id !== id));
      if (editingExperienceId === id) {
        setEditingExperienceId(null);
        setEditingExperience(null);
        setEditingSkillInput("");
      }
    }
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">프로필 수정</h1>

        <div className="space-y-6">
        {/* 내 정보 수정하기 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">내 정보 수정하기</h2>
          </div>

          {/* 프로필 사진 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={profileImage || user?.picture || "https://placehold.co/96x96?text=프로필"}
                alt="profile"
                className="w-24 h-24 rounded-full bg-gray-200 object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">프로필</p>
              <div className="flex gap-2">
                <button
                  onClick={handleProfileImageChange}
                  className="px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  사진 변경
                </button>
                <button
                  onClick={handleProfileImageDelete}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  지우기
                </button>
              </div>
            </div>
          </div>

          {/* 입력 필드 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 왼쪽 열 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">성</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="성"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">나이</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="나이"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  거주지
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="거주지"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">한줄 소개</label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="한줄 소개를 입력하세요"
                />
              </div>
            </div>

            {/* 오른쪽 열 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="휴대폰 번호"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 대표 이력 수정하기 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-800">대표 이력 수정하기</h2>
            </div>
            <button
              onClick={handleAddExperience}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + 추가하기
            </button>
          </div>

          <div className="space-y-4">
            {workExperiences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>추가된 이력이 없습니다. "+ 추가하기" 버튼을 눌러 이력을 추가하세요.</p>
              </div>
            ) : (
              workExperiences.map((exp) => (
                <div key={exp.id} className={`p-4 border-2 rounded-lg ${
                  editingExperienceId === exp.id 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 bg-white"
                }`}>
                  {editingExperienceId === exp.id && editingExperience ? (
                    // 편집 모드
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                        <input
                          type="text"
                          value={editingExperience.company}
                          onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="회사명을 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                        <input
                          type="text"
                          value={editingExperience.location}
                          onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="위치를 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                        <input
                          type="text"
                          value={editingExperience.period}
                          onChange={(e) => setEditingExperience({ ...editingExperience, period: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="예: Mar 2021 - Present"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">스킬</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editingExperience.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {skill}
                              <button
                                onClick={() => handleRemoveSkill(index)}
                                className="hover:text-blue-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingSkillInput}
                            onChange={(e) => setEditingSkillInput(e.target.value)}
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
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveExperience}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancelEditExperience}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{exp.company || "회사명 없음"}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {exp.location && exp.period 
                            ? `${exp.location} · ${exp.period}`
                            : exp.location || exp.period || "정보 없음"}
                        </p>
                        {exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {exp.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                        )}
                    <div className="flex gap-4">
                          <button
                            onClick={() => handleStartEditExperience(exp)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            수정
                          </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                      >
                            삭제
                      </button>
                    </div>
                  </div>
                </div>
                  )}
              </div>
              ))
            )}
          </div>
        </div>
      </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
