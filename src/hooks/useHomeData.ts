import { useState, useEffect, useMemo } from "react";
import { workService } from "../api/workService";
import { albaService } from "../api/albaService"; 
import { getSettlementHistory } from "../api/settlement";
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
      // 근무 정보와 정산 내역
      const [s, schedules, settlementData] = await Promise.all([
        workService.getTodaySummary(),
        workService.getTodayWorkLogs(),
        getSettlementHistory("all").catch(() => ({ settlements: [] })) 
      ]);

      // 대시보드 요약 세팅
      setSummary({
        totalCount: s.workCount || 0,
        totalHours: Math.floor((s.totalWorkMinutes || 0) / 60), 
        totalIncome: s.expectedIncome || 0
      });

      // 정산 대기(waiting) 상태인 건수 계산
      const pendingSettlementCount = settlementData.settlements.filter(
        (item: any) => item.settlementStatus === "waiting"
      ).length;

      // 알림 요약 세팅 (정산 대기 연동)
      setNotifSummary({
        scheduled: schedules.filter((item: any) => item.status === 'scheduled').length,
        completed: schedules.filter((item: any) => ['completed', 'done', 'working'].includes(item.status)).length,
        pending: pendingSettlementCount,
      });

      // 근무 리스트 매핑
      const mappedList: Work[] = schedules.map((item: any) => {
        const formatTime = (iso: string) => {
          if (!iso) return "00:00";
          const d = new Date(iso);
          return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
        };

        return {
          id: item.workLogId || item.id,
          name: item.workplace || item.storeName || "알바 매장",
          category: "아르바이트",
          time: `${formatTime(item.startTime)} ~ ${formatTime(item.endTime)}`,
          duration: item.workHours || 0,
          pay: item.hourlyWage || 0,
          expectedPay: item.totalWage || 0,
          status: item.status,
          statusLabel: item.statusLabel,
          address: item.address || "",
          date: item.workDate || new Date().toISOString().split('T')[0],
        };
      });
      setWorkList(mappedList);

      // 추천 공고 로직
      const scheduleItemsForCalc = mappedList.map((w: Work) => {
        const [start, end] = w.time.split(" ~ ");
        return { workplaceId: w.id, startTime: start, endTime: end };
      });

      const currentFreeSlot = findDynamicFreeSlot(scheduleItemsForCalc as any);

      if (currentFreeSlot && currentFreeSlot.includes("~")) {
        const [start, end] = currentFreeSlot.replace(/시/g, "").split("~");
        const albaList = await albaService.getAlbaList({ 
          workTime: `${start.trim().padStart(2, '0')}:00~${end.trim().padStart(2, '0')}:00` 
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
    workList, summary, notifSummary, freeSlot, recommendCount, isLoading, isModalOpen, setIsModalOpen,
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
        } catch (error) { alert("처리에 실패했습니다."); }
      },
    }
  };
};