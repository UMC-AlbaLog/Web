import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e9edff]">

      {/* ===== Background Base Gradient ===== */}
      <div className="absolute inset-0 bg-gradient-to-br 
        from-[#e4e9ff] 
        via-[#d8e0ff] 
        to-[#cfe7f5] 
        opacity-95"
      />

      {/* ===== Purple Glow ===== */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] 
        bg-purple-300/40 rounded-full blur-[160px]"
      />

      {/* ===== Blue Glow ===== */}
      <div className="absolute bottom-[-200px] right-[-200px] w-[700px] h-[700px] 
        bg-blue-300/40 rounded-full blur-[180px]"
      />

      {/* ===== Soft Teal Glow ===== */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] 
        bg-teal-200/30 rounded-full blur-[160px]"
      />

      {/* ===== Content Wrapper ===== */}
      <div className="relative z-10">

        {/* ===== Header ===== */}
        <header className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              🗓️
            </div>
            알바로그
          </div>

          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-md text-sm font-semibold hover:bg-white transition"
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
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop"
              alt="coins"
              className="w-[420px] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
            />
          </div>
        </section>

        {/* ===== Feature Cards ===== */}
        <section className="max-w-7xl mx-auto px-8 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
            <p className="font-semibold text-gray-900 mb-2">
              오늘 빈 시간
              <br />수익계산 UI
            </p>
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop"
              className="mt-4 rounded-xl"
              alt="calculator"
            />
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
            <p className="font-semibold text-gray-900 mb-2">
              원하는 장소로
              <br />스마트한 매칭
            </p>
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop"
              className="mt-4 rounded-xl"
              alt="map"
            />
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
            <p className="font-semibold text-gray-900 mb-2">
              복잡한 절차 없는
              <br />개인 프리랜서 알바 관리
            </p>
            <img
              src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=800&auto=format&fit=crop"
              className="mt-4 rounded-xl"
              alt="calendar"
            />
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="max-w-7xl mx-auto px-8 mt-24 pb-24">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-12 flex flex-col items-center text-center text-white shadow-[0_30px_80px_rgba(79,70,229,0.5)]">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              지금 바로 스마트한 알바 생활을 시작해보세요.
            </h2>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 rounded-full bg-white text-indigo-600 font-bold hover:scale-105 transition"
            >
              알바로그 무료로 시작하기
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Landing;
