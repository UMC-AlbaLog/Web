import { useState, useEffect, useMemo } from "react";
import { workService } from "../api/workService";
import { albaService } from "../api/albaService"; 
import { findDynamicFreeSlot } from "../utils/scheduleUtils";
import type { Work } from "../types/work";
import type { AddWorkRequest } from "../components/home/AddWorkModal";

export const useHomeData = () => {
  const [workList, setWorkList] = useState<Work[]>([]);
  const [summary, setSummary] = useState({ totalCount: 0, totalHours: 0, totalIncome: 0 });
  const [notifSummary, setNotifSummary] = useState({ completed: 0, scheduled: 0, pending: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendCount, setRecommendCount] = useState(0);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [s, schedules] = await Promise.all([
        workService.getTodaySummary(),
        workService.getTodayWorkLogs()
      ]);

      setSummary({
        totalCount: s.workCount || 0,
        totalHours: Math.floor((s.totalWorkMinutes || 0) / 60), 
        totalIncome: s.expectedIncome || 0
      });

      setNotifSummary({
        scheduled: schedules.filter((item: any) => item.status === 'scheduled').length,
        completed: schedules.filter((item: any) => item.status === 'completed' || item.status === 'done').length,
        pending: schedules.filter((item: any) => item.status === 'pending').length,
      });

      const mappedList: Work[] = schedules.map((item: any) => ({
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

      const scheduleItemsForCalc = mappedList.map((w: Work) => {
        const [start, end] = w.time.split(" ~ ");
        return { workplaceId: w.id, startTime: start, endTime: end };
      });

      const currentFreeSlot = findDynamicFreeSlot(scheduleItemsForCalc as any);

      if (currentFreeSlot && currentFreeSlot.includes("~")) {
        const [start, end] = currentFreeSlot.replace("시", "").split("~");
        const albaList = await albaService.getAlbaList({ 
          startTime: start.padStart(2, '0') + ":00", 
          endTime: end.padStart(2, '0') + ":00" 
        });
        setRecommendCount(albaList.length || 0);
      } else {
        setRecommendCount(0);
      }

    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const freeSlot = useMemo(() => {
    if (isLoading || !workList.length) return "알바를 등록하고 빈 시간을 확인해보세요!";
    
    const scheduleItems = workList.map((w: Work) => {
      const [start, end] = w.time.split(" ~ ");
      return { workplaceId: w.id, startTime: start, endTime: end };
    });
    
    return findDynamicFreeSlot(scheduleItems as any);
  }, [workList, isLoading]);

  return {
    workList, 
    summary, 
    notifSummary, 
    freeSlot, 
    recommendCount, 
    isLoading, 
    isModalOpen, 
    setIsModalOpen,
    actions: { 
      fetchData,
      handleAddWork: async (data: AddWorkRequest) => {
        await workService.addSchedule(data);
        await fetchData();
        return true;
      },
      handleAction: async (id: string, currentStatus: string) => { 
        try {
          if (currentStatus === 'scheduled') {
            await workService.checkIn(id);
            alert("출근 처리가 완료되었습니다.");
          } else if (currentStatus === 'working') {
            await workService.checkOut(id); 
            alert("퇴근 처리가 완료되었습니다.");
          }
          await fetchData();
        } catch (error) {
          console.error("액션 처리 실패:", error);
          alert("처리에 실패했습니다. 다시 시도해주세요.");
        }
       },
      handleDeleteWork: async (id: string) => { 
        if(window.confirm("삭제할까요?")) {
          await workService.deleteSchedule(id);
          await fetchData();
        }
      } 
    }
  };
};