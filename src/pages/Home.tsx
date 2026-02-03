import React from "react";
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
  const { 
    workList, isModalOpen, setIsModalOpen, 
    actions: { handleAddWork, handleAction, handleDeleteWork } 
  } = useHomeData();

  const timeRemainingMessage = useWorkTimeMessage(workList);

  return (
    <main className="p-8 flex-1 overflow-y-auto bg-[#F5F6FA] font-['Pretendard']">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <section className="space-y-4 text-left">
          <h1 className="text-xl font-bold text-gray-900">오늘의 근무</h1>
          <Summary workList={workList} />
          {timeRemainingMessage && (
            <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <span className="text-red-400 text-sm">⏰</span> {timeRemainingMessage}
            </p>
          )}
        </section>

        <section className="space-y-6 text-left">
          <h1 className="text-xl font-bold text-gray-900">오늘의 근무 리스트</h1>
          <div className="flex gap-8 items-start">
            
            <div className="flex-1 flex flex-col gap-4 min-h-100">
              {workList.length === 0 ? (
                <TodayWork onAddClick={() => setIsModalOpen(true)} />
              ) : (
                workList.map((work) => (
                  <WorkList 
                    key={work.id} work={work}
                    onAction={() => handleAction(work.id, work.status)}
                    onDelete={() => handleDeleteWork(work.id)}
                  />
                ))
              )}
            </div>
            
            <div className="w-80 flex flex-col gap-6 shrink-0">
              {workList.length > 0 && <NotificationSummary workList={workList} />}
              <QuickAction onAddClick={() => setIsModalOpen(true)} />
            </div>
          </div>
        </section>

        <Recommend onDetailClick={() => navigate('/jobs')} />
      </div>

      {isModalOpen && (
        <AddWorkModal 
          onAdd={handleAddWork} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </main>
  );
};

export default Home;