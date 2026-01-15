import { type ChangeEvent, useState } from "react";

const ProfileEdit = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [basicInfo, setBasicInfo] = useState({
    name: "홍길동",
    age: "25세",
    address: "서울시 마포구 거주",
  });

  const [career, setCareer] = useState({
    storeName: "스타벅스 용산점",
    period: "2025.11.03~현재",
    type: "카페",
    mainTask: "손님 응대, 음료 제조, 매장 청소",
  });

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  const handleBasicChange = (
    field: keyof typeof basicInfo,
    value: string
  ) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCareerChange = (
    field: keyof typeof career,
    value: string
  ) => {
    setCareer((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="flex-1 bg-gray-200 px-16 py-8">
      {/* 큰 편집 박스 */}
      <section className="bg-white rounded-2xl shadow mx-auto w-full max-w-5xl px-16 py-12 relative">
        {/* 상단 우측 수정하기 버튼 */}
        <button
          type="button"
          className="absolute top-8 right-10 text-lg font-bold"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "수정 완료" : "수정하기"}
        </button>

        {/* 프로필 사진 영역 - 사진 클릭으로 변경 */}
        <div className="flex flex-col items-center mb-10">
          <label className="relative w-40 h-40 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
            {photoUrl && (
              <img
                src={photoUrl}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        {/* 기본 정보 테이블 */}
        <div className="mb-16">
          <table className="w-full border border-black text-center">
            <tbody>
              <tr>
                <td className="border border-black px-6 py-3 font-bold bg-gray-50 w-32">
                  이름
                </td>
                <td className="border border-black px-6 py-3">
                  {isEditing ? (
                    <input
                      className="w-full outline-none text-center"
                      value={basicInfo.name}
                      onChange={(e) =>
                        handleBasicChange("name", e.target.value)
                      }
                    />
                  ) : (
                    basicInfo.name
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-6 py-3 font-bold bg-gray-50">
                  나이
                </td>
                <td className="border border-black px-6 py-3">
                  {isEditing ? (
                    <input
                      className="w-full outline-none text-center"
                      value={basicInfo.age}
                      onChange={(e) =>
                        handleBasicChange("age", e.target.value)
                      }
                    />
                  ) : (
                    basicInfo.age
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-6 py-3 font-bold bg-gray-50">
                  주소
                </td>
                <td className="border border-black px-6 py-3">
                  {isEditing ? (
                    <input
                      className="w-full outline-none text-center"
                      value={basicInfo.address}
                      onChange={(e) =>
                        handleBasicChange("address", e.target.value)
                      }
                    />
                  ) : (
                    basicInfo.address
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 대표 이력 수정하기 제목 */}
        <h2 className="font-bold text-xl mb-4">대표 이력 수정하기</h2>

        {/* 대표 이력 테이블 */}
        <table className="w-full border border-black">
          <tbody>
            <tr>
              <td className="border border-black px-6 py-3 font-bold bg-gray-50 w-32">
                매장명
              </td>
              <td className="border border-black px-6 py-3">
                {isEditing ? (
                  <input
                    className="w-full outline-none"
                    value={career.storeName}
                    onChange={(e) =>
                      handleCareerChange("storeName", e.target.value)
                    }
                  />
                ) : (
                  career.storeName
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-black px-6 py-3 font-bold bg-gray-50">
                기간
              </td>
              <td className="border border-black px-6 py-3">
                {isEditing ? (
                  <input
                    className="w-full outline-none"
                    value={career.period}
                    onChange={(e) =>
                      handleCareerChange("period", e.target.value)
                    }
                  />
                ) : (
                  career.period
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-black px-6 py-3 font-bold bg-gray-50">
                타입
              </td>
              <td className="border border-black px-6 py-3">
                {isEditing ? (
                  <input
                    className="w-full outline-none"
                    value={career.type}
                    onChange={(e) =>
                      handleCareerChange("type", e.target.value)
                    }
                  />
                ) : (
                  career.type
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-black px-6 py-3 font-bold bg-gray-50">
                주요업무
              </td>
              <td className="border border-black px-6 py-3">
                {isEditing ? (
                  <textarea
                    className="w-full outline-none resize-none leading-relaxed"
                    rows={3}
                    value={career.mainTask}
                    onChange={(e) =>
                      handleCareerChange("mainTask", e.target.value)
                    }
                  />
                ) : (
                  career.mainTask
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default ProfileEdit;
