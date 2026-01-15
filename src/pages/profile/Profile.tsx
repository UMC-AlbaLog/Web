import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <main className="flex-1 bg-gray-200">
      <div className="px-16 pt-6 pb-10">
        {/* 내 정보 제목 + 상단 버튼들 한 줄 배치 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-bold">내 정보</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/profile/reviews")}
              className="bg-white border px-4 py-2 rounded"
            >
              내 리뷰 모아보기
            </button>
            <button
              onClick={() => navigate("/profile/edit")}
              className="bg-white border px-4 py-2 rounded"
            >
              정보수정
            </button>
          </div>
        </div>

        {/* 내 정보 박스 */}
        <section className="bg-white rounded-lg px-14 py-10 flex items-center mb-10">
          <div className="w-28 h-28 bg-gray-300 rounded-full flex-shrink-0" />

          <div className="ml-10">
            <p className="font-bold text-xl mb-1">홍길동</p>
            <p className="text-base leading-relaxed">25세</p>
            <p className="text-base leading-relaxed">서울시 마포구 거주</p>
          </div>
        </section>

        {/* 프로필 아래 전체 구분선 */}
        <hr className="border-t-2 border-gray-800 my-10" />

        <div className="grid grid-cols-2 gap-10">
          {/* 왼쪽: 신뢰 지표 + 활동 배지 (텍스트와 가로선으로만 구분) */}
          <div>
            <h2 className="font-bold text-lg mb-10">신뢰 지표</h2>
            <div className="mb-16 text-center">
              <p className="text-3xl font-extrabold leading-snug">
                아직 평가가 없습니다
              </p>
            </div>

            {/* 신뢰 지표와 활동 배지 사이 짧은 가로선 */}
            <div className="border-t-2 border-gray-800 w-[96%] mb-8" />

            <h3 className="font-bold mb-4">활동 배지</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-center">
                <span className="w-7 h-7 bg-white border border-gray-300 rounded" />
                <span>주말 대타 5회 달성</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="w-7 h-7 bg-white border border-gray-300 rounded" />
                <span>편의점 최초 근무</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="w-7 h-7 bg-white border border-gray-300 rounded" />
                <span>지각 없이 연속 10회 근무</span>
              </li>
            </ul>
          </div>

          {/* 오른쪽: 알바 경험 이력 + 대표 이력 (흰색 박스) */}
          <div className="space-y-6 flex flex-col">
            {/* 알바 경험 이력 */}
            <section className="bg-white p-6 rounded-lg shadow-sm flex-1 flex flex-col justify-center min-h-[200px]">
              <h3 className="font-bold mb-2">알바 경험 이력</h3>
              <p className="text-sm text-gray-600 mb-2">2025.11.03~2025.11.19</p>
              <p className="text-sm text-gray-500">
                아직 알바 이력이 없습니다
              </p>
            </section>

            {/* 대표 이력 */}
            <section className="bg-white p-6 rounded-lg shadow-sm flex-1 flex flex-col justify-center min-h-[200px]">
              <h3 className="font-bold mb-2">대표 이력</h3>
              <p className="text-sm text-gray-500">
                대표 이력이 설정되지 않았습니다
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
