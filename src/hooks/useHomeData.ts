import { useState, useMemo } from "react";
import type { Work, WorkStatus } from "../types/work";
import { useSchedules } from "../contexts/SchedulesContext";
import { calculateDuration } from "../utils/scheduleUtils";

export const useHomeData = () => {
  const { schedules, workplaces, setSchedules, setWorkplaces } = useSchedules();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");

  const workList = useMemo<Work[]>(() => {
    return schedules
      .filter((s) => s.date === today)
      .map((s) => {
        const workplace = workplaces.find((w) => w.id === s.workplaceId);
        const actualDuration = calculateDuration(s.startTime, s.endTime);
        return {
          id: s.id,
          name: workplace?.name || "알바",
          category: (s as any).category || "기타",
          address: (s as any).address || "",
          time: `${s.startTime} ~ ${s.endTime}`,
          duration: actualDuration,
          pay: s.hourlyWage || 0,
          expectedPay: Math.floor(actualDuration * (s.hourlyWage || 0)),
          date: s.date,
          memo: s.memo || "",
          status: (s.status as WorkStatus) || ("upcoming" as WorkStatus),
          description: "",
          requirements: "",
          notice: "",
        };
      });
  }, [schedules, workplaces, today]);

  const handleAddWork = (newWork: Omit<Work, "id" | "status"> & { category?: string }) => {
    const newId = Date.now().toString();
    const newWpId = `wp-${newId}`;
    const [startTime, endTime] = newWork.time.split(" ~ ");

    let targetWorkplaceId: string;
    const existing = workplaces.find((w) => w.name === newWork.name);
    if (existing) {
      targetWorkplaceId = existing.id;
    } else {
      targetWorkplaceId = newWpId;
      setWorkplaces((prev) => [...prev, { id: newWpId, name: newWork.name, color: "#5D5FEF" }]);
    }

    const scheduleEntry = {
      id: newId,
      workplaceId: targetWorkplaceId,
      date: newWork.date,
      startTime,
      endTime,
      hourlyWage: newWork.pay,
      memo: newWork.memo,
      status: "upcoming" as const,
      category: newWork.category,
      address: newWork.address,
    };

    setSchedules((prev) => [...prev, scheduleEntry]);
    setIsModalOpen(false);
  };

  return {
    workList,
    isModalOpen,
    setIsModalOpen,
    actions: { 
      handleAddWork, 
      handleAction: (id: string, currentStatus: string) => {
        const nextStatus: WorkStatus = currentStatus === "upcoming" ? "working" : "done";
        setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)));
      }, 
      handleDeleteWork: (id: string) => {
        if (window.confirm("이 알바 일정을 삭제할까요?")) setSchedules((prev) => prev.filter((s) => s.id !== id));
      } 
    }
  };
};