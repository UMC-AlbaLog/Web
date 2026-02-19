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

      const formatToLocalTime = (timeStr: any) => {
        if (!timeStr || typeof timeStr !== 'string') return "00:00";

        if (timeStr.includes('-') || timeStr.includes('T')) {
          let cleanIso = timeStr.replace(/-/g, "/").replace(" ", "T");
          if (!cleanIso.endsWith('Z') && cleanIso.includes('T')) cleanIso += 'Z';
          const date = new Date(cleanIso);
          if (!isNaN(date.getTime())) {
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          }
        }

        const timeRegex = /^(\d{1,2}):(\d{1,2})/;
        const match = timeStr.match(timeRegex);
  
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = match[2];
    
          hours = (hours + 9) % 24;
    
          return `${String(hours).padStart(2, '0')}:${minutes}`;
        }

        return timeStr.slice(0, 5);
      };

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
        completed: schedules.filter((item: any) => ['completed', 'done', 'settled'].includes(item.status)).length,
        pending: pendingSettlementCount,
      });

      // 근무 리스트 매핑 (workplace_name 우선, ID는 이름으로 표시하지 않음)
      const getWorkplaceDisplayName = (item: any) => {
        const byName = item.workplace_name ?? item.workplaceName ?? item.storeName ?? "";
        if (byName && String(byName).trim()) return String(byName).trim();
        const raw = item.workplace ?? "";
        const s = String(raw).trim();
        const looksLikeId = /^\d+$/.test(s) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || (s.length >= 10 && /^[\w-]+$/.test(s));
        return looksLikeId ? "알바 매장" : s || "알바 매장";
      };

      const mappedList: Work[] = schedules.map((item: any) => {
        return {
          id: item.workLogId || item.id,
          name: getWorkplaceDisplayName(item),
          category: item.category || item.storeCategory || "기타",
          time: `${formatToLocalTime(item.startTime)} ~ ${formatToLocalTime(item.endTime)}`,
          duration: item.workHours || 0,
          pay: item.hourlyWage || 0,
          expectedPay: item.totalWage || 0,
          status: item.status,
          statusLabel: item.statusLabel,
          address: item.address || item.storeAddress || "",
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

      if (currentFreeSlot && currentFreeSlot.includes("-")) {
        const timePart = currentFreeSlot.split("요일")[1]?.trim();
        if (timePart) {
          const [start, end] = timePart.split("-").map(t => t.trim());
          const albaList = await albaService.getAlbaList({ 
            workTime: `${start}~${end}` 
          });
          setRecommendCount(albaList.length || 0);
        }
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
        setTimeout(() => fetchData(), 1000);
        return true;
      },
      handleAction: async (id: string, currentStatus: string) => { 
        try {
          if (currentStatus === 'scheduled') {
            await workService.checkIn(id);
            setWorkList(prev => prev.map(w => w.id === id ? { ...w, status: 'working' } : w));
            alert("출근 처리가 완료되었습니다.");
          } else if (currentStatus === 'working') {
            await workService.checkOut(id); 
            setWorkList(prev => prev.map(w => w.id === id ? { ...w, status: 'done' } : w));
            alert("퇴근 처리가 완료되었습니다.");
          }
          setTimeout(() => fetchData(), 1500);
        } catch (error) { 
          console.error("출퇴근 처리 실패:", error);
          alert("처리에 실패했습니다."); 
          fetchData();
        }
      },
    }
  };
};