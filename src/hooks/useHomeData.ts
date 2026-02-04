import { useState, useMemo, useEffect } from "react";
import type { Work, WorkStatus } from "../types/work";
import { useSchedules } from "../contexts/SchedulesContext";
import { calculateDuration } from "../utils/scheduleUtils";
import { getAccessToken } from "../api/client";
import { getTodayWorkLogs } from "../api/workLogs";
import { createScheduleQuickAdd } from "../api/schedule";

function mapApiStatusToWorkStatus(status: string): WorkStatus {
  const lower = status?.toLowerCase() ?? "";
  if (lower === "working" || lower === "in_progress") return "working";
  if (lower === "done" || lower === "completed" || lower === "finished") return "done";
  return "upcoming";
}

export const useHomeData = () => {
  const { schedules, workplaces, setSchedules, setWorkplaces } = useSchedules();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workListFromApi, setWorkListFromApi] = useState<Work[] | null>(null);

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setWorkListFromApi(null);
      return;
    }
    getTodayWorkLogs()
      .then((res) => {
        if (!res?.schedules?.length) {
          setWorkListFromApi(null);
          return;
        }
        const list: Work[] = res.schedules.map((s) => ({
          id: s.workLogId,
          name: s.workplace,
          address: "",
          time: `${s.startTime} ~ ${s.endTime}`,
          duration: s.workHours,
          pay: s.hourlyWage,
          expectedPay: s.totalWage,
          date: res.date,
          memo: "",
          status: mapApiStatusToWorkStatus(s.status),
          description: "",
          requirements: "",
          notice: "",
        }));
        setWorkListFromApi(list);
      })
      .catch(() => setWorkListFromApi(null));
  }, [today]);

  const workListLocal = useMemo<Work[]>(() => {
    return schedules
      .filter((s) => s.date === today)
      .map((s) => {
        const workplace = workplaces.find((w) => w.id === s.workplaceId);
        const actualDuration = calculateDuration(s.startTime, s.endTime);
        return {
          id: s.id,
          name: workplace?.name || "알바",
          address: "",
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

  const workList = workListFromApi !== null ? workListFromApi : workListLocal;

  const handleAddWork = async (newWork: Omit<Work, "id" | "status">) => {
    const [startTime, endTime] = newWork.time.split(" ~ ");
    const token = getAccessToken();

    if (token) {
      const res = await createScheduleQuickAdd({
        workplace: newWork.name,
        workDate: newWork.date,
        startTime,
        endTime,
        hourlyWage: newWork.pay,
        memo: newWork.memo ?? "",
      });
      if (res) {
        const newWpId = `wp-${res.scheduleId}`;
        let targetWorkplaceId: string;
        const existing = workplaces.find((w) => w.name === newWork.name);
        if (existing) {
          targetWorkplaceId = existing.id;
        } else {
          targetWorkplaceId = newWpId;
          setWorkplaces((prev) => [...prev, { id: newWpId, name: newWork.name, color: "#4ECDC4" }]);
        }
        setSchedules((prev) => [
          ...prev,
          {
            id: res.scheduleId,
            workplaceId: targetWorkplaceId,
            date: res.workDate,
            startTime,
            endTime,
            hourlyWage: res.hourlyWage,
            memo: res.memo ?? "",
            status: "upcoming" as const,
          },
        ]);
        setWorkListFromApi(null);
        setIsModalOpen(false);
        return;
      }
    }

    const newId = Date.now().toString();
    const newWpId = `wp-${newId}`;
    let targetWorkplaceId: string;
    const existing = workplaces.find((w) => w.name === newWork.name);
    if (existing) {
      targetWorkplaceId = existing.id;
    } else {
      targetWorkplaceId = newWpId;
      setWorkplaces((prev) => [...prev, { id: newWpId, name: newWork.name, color: "#4ECDC4" }]);
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
    };
    setSchedules((prev) => [...prev, scheduleEntry]);
    setWorkListFromApi(null);
    setIsModalOpen(false);
  };

  const handleAction = (id: string, currentStatus: string) => {
    const nextStatus: WorkStatus = currentStatus === "upcoming" ? "working" : "done";
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
  };

  const handleDeleteWork = (id: string) => {
    if (window.confirm("이 알바 일정을 삭제할까요?")) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return {
    workList,
    isModalOpen,
    setIsModalOpen,
    actions: { handleAddWork, handleAction, handleDeleteWork }
  };
};