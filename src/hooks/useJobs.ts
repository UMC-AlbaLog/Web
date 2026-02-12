import { useState, useEffect } from "react";
import { albaService, type AlbaSearchParams } from "../api/albaService";
import type { Work } from "../types/work";

export const useJobs = (filterStates: any) => {
  const [jobs, setJobs] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params: AlbaSearchParams = {
          workDate: filterStates.date,
          storeCategory: filterStates.category || undefined,
          storeName: filterStates.name || undefined,
          hourlyRate: filterStates.pay,
          workTime: `${filterStates.startTime}~${filterStates.endTime}`,
        };

        const results = await albaService.getAlbaList(params);

        const mappedJobs: Work[] = (results || []).map((item: any) => {
          const start = new Date(item.startTime);
          const end = new Date(item.endTime);
          
          const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          const durationHours = diff <= 0 ? 1 : diff;

          return {
            id: item.albaId,
            name: item.storeName,
            pay: item.hourlyRate,
            date: filterStates.date,
            startTime: item.startTime,
            endTime: item.endTime,
            time: `${String(start.getHours()).padStart(2, '0')}:00~${String(end.getHours() + (diff <= 0 ? 1 : 0)).padStart(2, '0')}:00 (${item.dayOfWeek})`,
            
            address: item.storeAddress || "서울특별시 중구 세종대로 110",
            
            status: "scheduled" as const,
            duration: durationHours,
            expectedPay: Math.floor(item.hourlyRate * durationHours),
            
            lat: 37.5665, 
            lng: 126.9780,
            
            hourlyRate: item.hourlyRate,
            memo: "",
            description: "상세 정보 확인이 필요합니다.",
            requirements: "공고 상세 내용을 확인해 주세요.",
            notice: "무단 결근 시 불이익이 있을 수 있습니다."
          };
        });

        setJobs(mappedJobs);
      } catch (error) {
        console.error("데이터 로드 중 에러 발생:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (filterStates.date) {
      fetchJobs();
    }
  }, [
    filterStates.date, 
    filterStates.category, 
    filterStates.name, 
    filterStates.startTime, 
    filterStates.endTime, 
    filterStates.pay
  ]);

  return { jobs, loading };
};