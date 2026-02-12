import { useState, useEffect, useCallback } from "react";
import { albaService, type AlbaSearchParams } from "../api/albaService";
import type { Work, ApplicationStatus } from "../types/work";
import { INITIAL_JOBS } from "../data/jobData";

export const useJobs = (filterStates: any = {}) => {
  const [jobs, setJobs] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [localJobs, setLocalJobs] = useState<Work[]>(INITIAL_JOBS);

  const getAppliedJobs = useCallback((): Work[] => {
    return localJobs.filter((j) => j.applicationStatus != null);
  }, [localJobs]);

  const updateApplicationStatus = useCallback((jobId: string, status: ApplicationStatus) => {
    setLocalJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, applicationStatus: status } : j))
    );
  }, []);

  const updateApplicationStatus = async (jobId: string, status: "approved" | "rejected") => {
    try {
      await albaService.updateApplicationStatus(jobId, status); 
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, applicationStatus: status } : job
      ));
      
      alert(status === "approved" ? "승인되었습니다." : "거절되었습니다.");
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      alert("변경 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (!filterStates?.date) {
      return;
    }
    const fetchJobs = async () => {
      if (!filterStates?.date) return;
      setLoading(true);
      try {
        const params: AlbaSearchParams = {
          workDate: filterStates.date,
          storeCategory: filterStates.category || undefined,
          storeName: filterStates.name || undefined,
          hourlyRate: filterStates.pay,
          workTime: filterStates.startTime && filterStates.endTime 
            ? `${filterStates.startTime}~${filterStates.endTime}` 
            : undefined,
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
            time: `${item.startTime}~${item.endTime}`,
            address: item.storeAddress || "주소 정보 없음",
            status: "scheduled" as const,
            applicationStatus: item.processStatus?.toLowerCase() || "pending",
            duration: durationHours,
            storeId: item.storeId,
            expectedPay: Math.floor(item.hourlyRate * durationHours),
            memo: "",
            description: "상세 정보 확인 필요",
            requirements: "상세 내용 확인 필요",
            notice: "무단 결근 주의"
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
  }, [filterStates?.date, filterStates?.category, filterStates?.name, filterStates?.startTime, filterStates?.endTime, filterStates?.pay]);

  return { jobs, loading, updateApplicationStatus }; 
};