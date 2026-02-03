import { useState, useEffect } from "react";
import { useJobs } from "./useJobs";

export const useReviewTarget = (id: string) => {
  const { jobs } = useJobs();
  const [targetInfo, setTargetInfo] = useState<{ name: string; date: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    const foundInJobs = jobs.find(j => j.id === id);
    if (foundInJobs) {
      setTargetInfo({ name: foundInJobs.name, date: foundInJobs.date });
    } else {
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const workplaces = JSON.parse(localStorage.getItem('workplaces') || '[]');
      const schedule = schedules.find((s: any) => s.id === id || s.jobId === id);
      
      if (schedule) {
        const wp = workplaces.find((w: any) => w.id === schedule.workplaceId);
        setTargetInfo({ name: wp?.name || schedule.workplaceName || "알바 매장", date: schedule.date });
      }
    }
  }, [jobs, id]);

  return targetInfo;
};