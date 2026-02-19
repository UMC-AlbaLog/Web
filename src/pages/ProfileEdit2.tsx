import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, type UpdateProfileRequest } from "../api/profile";

const ProfileEdit2: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    userName: "",
    userBirth: "",
    gender: "male",
    profileImage: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 기존 프로필 불러오기
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setFormData({
          userName: data.userName ?? "",
          userBirth: data.userBirth ?? "",
          gender: data.gender ?? "male",
          profileImage: data.profileImage ?? "",
        });

        setPreviewImage(data.profileImage ?? null);
      } catch (error) {
        console.error("프로필 로드 실패:", error);
        alert("프로필 정보를 불러오지 못했습니다.");
      }
    };

    loadProfile();
  }, []);

  /**
   * 일반 입력 변경
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * 이미지 업로드 → Base64 변환
   */
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setFormData((prev) => ({
        ...prev,
        profileImage: base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  /**
   * 저장
   */
  const handleSubmit = async () => {
    if (!formData.userName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!formData.userBirth) {
      alert("생년월일을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await updateProfile(formData);
      alert("프로필이 수정되었습니다.");
      navigate("/profile");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          프로필 수정
        </h2>

        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={previewImage || "/default-avatar.png"}
            alt="profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow"
          />
          <label className="mt-4 cursor-pointer text-sm text-purple-600 hover:underline">
            사진 변경
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* 이름 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* 생년월일 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            생년월일
          </label>
          <input
            type="date"
            name="userBirth"
            value={formData.userBirth}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* 성별 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            성별
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit2;
