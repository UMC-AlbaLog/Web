import { useState, useEffect } from "react";
import { workService } from "../api/workService";
import type { Work } from "../types/work";
import type { AddWorkRequest } from "../components/home/AddWorkModal";

export const useHomeData = () => {
  const [workList, setWorkList] = useState<Work[]>([]);
  const [summary, setSummary] = useState({ totalCount: 0, totalHours: 0, totalIncome: 0 });
  const [notifSummary, setNotifSummary] = useState({ completed: 0, scheduled: 0, pending: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const s = await workService.getTodaySummary();
      const schedules = await workService.getTodayWorkLogs();

      setSummary({
        totalCount: s.workCount || 0,
        totalHours: Math.floor((s.totalWorkMinutes || 0) / 60), 
        totalIncome: s.expectedIncome || 0
      });

      // 알림 요약 자동 계산
      setNotifSummary({
        scheduled: schedules.filter((item: any) => item.status === 'scheduled').length,
        completed: schedules.filter((item: any) => item.status === 'completed').length,
        pending: schedules.filter((item: any) => item.status === 'pending').length,
      });

      const mappedList = schedules.map((item: any) => ({
        id: item.workLogId,
        name: item.workplace,
        category: "아르바이트",
        time: `${item.startTime} ~ ${item.endTime}`,
        duration: item.workHours,
        pay: item.hourlyWage,
        expectedPay: item.totalWage,
        status: item.status,
        statusLabel: item.statusLabel,
        address: item.address || "",
      }));
      setWorkList(mappedList);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddWork = async (data: AddWorkRequest): Promise<boolean> => {
    try {
      await workService.addSchedule(data);
      await fetchData();
      return true;
    } catch (error) {
      alert("일정 추가 실패!");
      return false;
    }
  };

  return {
    workList, summary, notifSummary, isModalOpen, setIsModalOpen,
    actions: { 
      handleAddWork, 
      handleAction: async (_id: string, _status: string) => { await fetchData(); },
      handleDeleteWork: async (id: string) => { 
        if(window.confirm("삭제할까요?")) {
          await workService.deleteSchedule(id);
          await fetchData();
        }
      } 
    }
  };
};