import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHomeData } from "../hooks/useHomeData"; 
import { useWorkTimeMessage } from "../hooks/useWorkTimeMessage";
import Summary from "../components/home/Summary";
import AddWorkModal from "../components/home/AddWorkModal";
import NotificationSummary from "../components/home/NotificationSummary";
import QuickAction from "../components/home/QuickAction";
import Recommend from "../components/home/Recommend";
import TodayWork from "../components/home/TodayWork";
import WorkList from "../components/home/WorkList";

const Home: React.FC = () => {
  const navigate = useNavigate();

  /* =========================
   * 토큰 처리 및 리다이렉트
   * ========================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) sessionStorage.setItem("accessToken", accessToken);
    if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);

    if (accessToken || refreshToken) {
      window.history.replaceState({}, document.title, "/home");
    }

    const savedAccess = sessionStorage.getItem("accessToken");
    if (!savedAccess) {
      console.log("No access token, redirecting to login.");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* =========================
   * 데이터 훅 및 유저 정보
   * ========================= */
  const { 
    username,
    workList, 
    summary, 
    notifSummary, 
    freeSlot, 
    recommendCount, 
    isLoading, 
    isModalOpen, 
    setIsModalOpen, 
    actions 
  } = useHomeData();

  const timeRemainingMessage = useWorkTimeMessage(workList);

  const hasToken = sessionStorage.getItem("accessToken");

  /* =========================
   *  렌더 조건만 분기
   * ========================= */
  if (!hasToken) return null;
  if (isLoading) return <div className="p-8 text-center font-bold text-gray-300">데이터를 불러오는 중입니다...</div>;

  return (
    <main className="p-8 flex-1 overflow-y-auto bg-[#F5F6FA] font-['Pretendard']">
      <div className="max-w-6xl mx-auto space-y-20">
        
        <section className="space-y-4 text-left">
          <h1 className="font-pretendard font-bold text-[38px] leading-[100%] align-middle text-gray-900">오늘의 근무</h1>
          <Summary 
            totalCount={summary.totalCount} 
            totalHours={summary.totalHours} 
            totalIncome={summary.totalIncome} 
          />
          {timeRemainingMessage && (
            <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-4">
              <span className="text-red-400 text-sm">⏰</span> {timeRemainingMessage}
            </p>
          )}
        </section>

        <section className="space-y-6 text-left">
          <h1 className="font-pretendard font-semibold text-[36px] leading-[100%] text-gray-900">오늘의 근무 리스트</h1>
          <div className="flex gap-8 items-start">
            <div className="flex-1 flex flex-col gap-4 min-h-100">
              {workList.length === 0 ? (
                <TodayWork /> 
              ) : (
                workList.map((work) => (
                  <WorkList 
                    key={work.id} 
                    work={work}
                    onAction={() => actions.handleAction(work.id, work.status)}
                  />
                ))
              )}
            </div>

            <div className="w-80 flex flex-col gap-6 shrink-0">
              {workList.length > 0 && <NotificationSummary summary={notifSummary} />}
              <QuickAction onAddClick={() => setIsModalOpen(true)} />
            </div>
          </div>
        </section>
        
        <Recommend 
          username={username}
          freeSlot={freeSlot}
          recommendCount={recommendCount}
          hasWork={workList.length > 0} 
          onDetailClick={() => navigate('/jobs')} 
        />
      </div>

      {isModalOpen && (
        <AddWorkModal 
          onAdd={actions.handleAddWork} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </main>
  );
};

export default Home;