import { useState, useEffect } from "react";
import type { Work, WorkStatus } from "../types/work";

// 시간 차이를 계산해주는 헬퍼 함수
const calculateDuration = (start: string, end: string): number => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  return totalMinutes > 0 ? totalMinutes / 60 : 0;
};

export const useHomeData = () => {
  const [workList, setWorkList] = useState<Work[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // [데이터 로드] 오늘 날짜만 필터링하고 정확한 수입 계산
  useEffect(() => {
    const savedSchedules = localStorage.getItem('schedules');
    const savedWorkplaces = localStorage.getItem('workplaces');

    if (savedSchedules) {
      const schedules = JSON.parse(savedSchedules);
      const workplaces = savedWorkplaces ? JSON.parse(savedWorkplaces) : [];
      const today = new Date().toLocaleDateString('en-CA'); 

      const mappedWork: Work[] = schedules
        .filter((s: any) => s.date === today) 
        .map((s: any) => {
          const workplace = workplaces.find((w: any) => w.id === s.workplaceId);
          const actualDuration = calculateDuration(s.startTime, s.endTime); 
          
          return {
            id: s.id,
            name: workplace?.name || s.workplaceName || "알바",
            address: s.address || "",
            time: `${s.startTime} ~ ${s.endTime}`,
            duration: actualDuration,
            pay: s.hourlyWage || 0,
            expectedPay: Math.floor(actualDuration * (s.hourlyWage || 0)), 
            date: s.date,
            memo: s.memo || "",
            status: (s.status as WorkStatus) || ("upcoming" as WorkStatus)
          };
        });
      setWorkList(mappedWork);
    }
  }, []);

  // [알바 추가] 동적 ID 매칭 및 저장
  const handleAddWork = (newWork: Omit<Work, "id" | "status">) => {
    const newId = Date.now().toString();
    const newWorkItem: Work = { ...newWork, id: newId, status: "upcoming" as WorkStatus };

    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const savedWorkplaces = JSON.parse(localStorage.getItem('workplaces') || '[]');

    let targetWorkplace = savedWorkplaces.find((w: any) => w.name === newWork.name);

    if (!targetWorkplace) {
      targetWorkplace = {
        id: `wp-${Date.now()}`,
        name: newWork.name,
        color: "#4ECDC4" 
      };
      localStorage.setItem('workplaces', JSON.stringify([...savedWorkplaces, targetWorkplace]));
    }

    const [startTime, endTime] = newWork.time.split(" ~ ");
    const scheduleEntry = {
      id: newId,
      workplaceId: targetWorkplace.id,
      date: newWork.date,
      startTime,
      endTime,
      hourlyWage: newWork.pay,
      memo: newWork.memo,
      status: "upcoming" as WorkStatus
    };

    localStorage.setItem('schedules', JSON.stringify([...savedSchedules, scheduleEntry]));

    const today = new Date().toLocaleDateString('en-CA');
    if (newWork.date === today) {
      setWorkList((prev) => [...prev, newWorkItem]);
    }
    
    setIsModalOpen(false);
  };

  // [상태 변경] 출근/퇴근 액션
  const handleAction = (id: string, currentStatus: string) => {
    const nextStatus: WorkStatus = currentStatus === "upcoming" ? "working" : "done";
    setWorkList(prev => prev.map(w => w.id === id ? { ...w, status: nextStatus } : w));

    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const updatedSchedules = savedSchedules.map((s: any) => 
      s.id === id ? { ...s, status: nextStatus } : s
    );
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
  };

  // [일정 삭제]
  const handleDeleteWork = (id: string) => {
    if (window.confirm("이 알바 일정을 삭제할까요?")) {
      setWorkList(prev => prev.filter(w => w.id !== id));
      const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const updatedSchedules = savedSchedules.filter((s: any) => s.id !== id);
      localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    }
  };

  return {
    workList,
    isModalOpen,
    setIsModalOpen,
    actions: { handleAddWork, handleAction, handleDeleteWork }
  };
};