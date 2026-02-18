import { useState, useEffect, useCallback } from "react";
import { albaService, type AlbaSearchParams } from "../api/albaService";
import type { Work, ApplicationStatus } from "../types/work";
import { INITIAL_JOBS } from "../data/jobData";

export type UseJobsFilterStates = {
  date?: string; category?: string; name?: string; startTime?: string; endTime?: string; pay?: number;
};

export const useJobs = (filterStates?: UseJobsFilterStates) => {
  const [jobs, setJobs] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [localJobs, setLocalJobs] = useState<Work[]>(INITIAL_JOBS);

  const getAppliedJobs = useCallback(() => localJobs.filter((j) => j.applicationStatus != null), [localJobs]);
  const updateApplicationStatus = useCallback((jobId: string, status: ApplicationStatus) => {
    setLocalJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applicationStatus: status } : j)));
  }, [localJobs]);

  useEffect(() => {
    if (!filterStates?.date) return;
    
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params: AlbaSearchParams = {
          workDate: filterStates.date,
          storeCategory: filterStates.category || undefined,
          storeName: filterStates.name || undefined,
          hourlyRate: filterStates.pay,
          workTime: `${filterStates.startTime ?? ""}~${filterStates.endTime ?? ""}`,
        };

        const results = await albaService.getAlbaList(params);

        const mappedJobs: Work[] = (results || []).map((item: any) => {
          const formatTime = (iso: string) => {
            if (!iso) return "00:00";
            const timePart = iso.includes('T') ? iso.split('T')[1] : iso;
            const [h, m] = timePart.split(':');
            return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
          };

          const start = new Date(item.startTime);
          const end = new Date(item.endTime);
          const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
          const durationHours = diff <= 0 ? 1 : diff;

          return {
            id: String(item.albaId),
            name: String(item.storeName),
            pay: Number(item.hourlyRate),
            date: filterStates.date ?? "",
            startTime: String(item.startTime ?? ""),
            endTime: String(item.endTime ?? ""),
            time: `${formatTime(item.startTime)} ~ ${formatTime(item.endTime)}`,
            address: String(item.storeAddress || "서울특별시 중구 세종대로 110"),
            status: "scheduled" as const,
            duration: Number(durationHours.toFixed(1)),
            expectedPay: Math.floor(Number(item.hourlyRate) * durationHours),
            lat: 37.5665, 
            lng: 126.978,
            memo: "", 
            description: "상세 정보 확인이 필요합니다.",
            requirements: "공고 상세 내용을 확인해 주세요.", 
            notice: "무단 결근 시 불이익이 있을 수 있습니다.",
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
    fetchJobs();
  }, [
    filterStates?.date, 
    filterStates?.category, 
    filterStates?.name, 
    filterStates?.startTime, 
    filterStates?.endTime, 
    filterStates?.pay]);

  const jobsToReturn = filterStates?.date ? jobs : localJobs;

  return { 
    jobs: jobsToReturn, 
    loading, 
    getAppliedJobs, 
    updateApplicationStatus 
  };
};