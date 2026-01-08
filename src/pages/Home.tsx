import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Summary from "../components/Summary";
import TodayWork from "../components/TodayWork";
import QuickAction from "../components/QuickAction";
import Recommend from "../components/Recommend";
import WorkList from "../components/WorkList";
import AddWorkModal from "../components/AddWorkModal";
import NotificationSummary from "../components/NotificationSummary";
import type { Work } from "../types/work";

const Home: React.FC = () => {
  const [workList, setWorkList] = useState<Work[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddWork = (newWork: Omit<Work, "id" | "status">) => {
    setWorkList((prev) => [...prev, { ...newWork, id: Date.now(), status: "upcoming" }]);
    setIsModalOpen(false);
  };

  const handleAction = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "upcoming" ? "working" : "done";
    setWorkList(prev => prev.map(w => w.id === id ? { ...w, status: nextStatus } : w));
  };

  const handleDeleteWork = (id: number) => {
    if (window.confirm("이 알바 일정을 삭제할까요?")) {
      setWorkList(prev => prev.filter(w => w.id !== id));
    }
  };

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
      {isModalOpen && <AddWorkModal onAdd={handleAddWork} onClose={() => setIsModalOpen(false)} />}
    </main>
  );
};

export default Home;