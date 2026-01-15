import React from "react";
import { useNavigate } from "react-router-dom";
import { useHomeData } from "../hooks/useHomeData"; 
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
    workList, 
    isModalOpen, 
    setIsModalOpen, 
    actions: { handleAddWork, handleAction, handleDeleteWork } 
  } = useHomeData();

  return (
    <main className="p-12 space-y-12 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <section className="space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900">오늘의 근무</h1>
        <Summary workList={workList} />
      </section>

      <section className="space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900">오늘의 근무 리스트</h1>
        <div className="flex gap-8 items-stretch">
          <div className="flex-1 flex flex-col">
            {workList.length === 0 ? (
              <TodayWork onAddClick={() => setIsModalOpen(true)} />
            ) : (
              <div className="space-y-6">
                {workList.map((work) => (
                  <WorkList 
                    key={work.id}
                    work={work}
                    onAction={() => handleAction(work.id, work.status)}
                    onDelete={() => handleDeleteWork(work.id)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="w-80 flex flex-col gap-6">
            <NotificationSummary workList={workList} />
            <QuickAction onAddClick={() => setIsModalOpen(true)} />
          </div>
        </div>
      </section>

      <Recommend onDetailClick={() => navigate('/jobs')} />
      
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