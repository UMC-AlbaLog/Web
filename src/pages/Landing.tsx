import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* ===== Header ===== */}
      <header className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
             🗓️
          </div>
          알바로그
        </div>

        <nav className="hidden md:flex gap-10 text-gray-600 font-medium">
          <span className="cursor-pointer hover:text-indigo-600">서비스 소개</span>
          <span className="cursor-pointer hover:text-indigo-600">주요 기능</span>
          <span className="cursor-pointer hover:text-indigo-600">알바 찾기</span>
        </nav>

        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-full bg-white shadow text-sm font-semibold hover:bg-indigo-50"
        >
          로그인/회원가입
        </button>
      </header>

      {/* ===== Hero ===== */}
      <section className="max-w-7xl mx-auto px-8 pt-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            오늘 빈 시간,
            <br />
            내 지갑을 채우는
            <br />
            가장 쉬운 방법.
          </h1>
        </div>

        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3"
            alt="coins"
            className="w-[420px] rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* ===== Feature Cards ===== */}
      <section className="max-w-7xl mx-auto px-8 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="font-semibold text-gray-900 mb-2">
            오늘 빈 시간
            <br />수익계산 UI
          </p>
          <img
            src="https://images.unsplash.com/photo-1587614382346-ac8c8b8c29f5"
            className="mt-4 rounded-xl"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="font-semibold text-gray-900 mb-2">
            원하는 장소로
            <br />스마트한 매칭
          </p>
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1"
            className="mt-4 rounded-xl"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="font-semibold text-gray-900 mb-2">
            복잡한 절차 없는
            <br />개인 프리랜서 알바 관리
          </p>
          <img
            src="https://images.unsplash.com/photo-1506784365847-bbad939e9335"
            className="mt-4 rounded-xl"
          />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-7xl mx-auto px-8 mt-24 pb-24">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-12 flex flex-col items-center text-center text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            지금 바로 스마트한 알바 생활을 시작해보세요.
          </h2>

          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-full bg-white text-indigo-600 font-bold hover:bg-indigo-50"
          >
            알바로그 무료로 시작하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
