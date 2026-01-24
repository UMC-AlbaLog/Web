import { useState, useEffect, useCallback } from "react";
import type { Work, ApplicationStatus } from "../types/work";
import { INITIAL_JOBS } from "../data/jobData";

const JOBS_STORAGE_KEY = "jobs_list";
const APPLICATIONS_STORAGE_KEY = "applications";

export const useJobs = () => {
  const [jobs, setJobs] = useState<Work[]>([]);
  const [applications, setApplications] = useState<Record<string, { status: ApplicationStatus; appliedDate: string }>>({});

  // 초기 데이터 로드 및 동기화
  useEffect(() => {
    const savedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
    const savedApplications = localStorage.getItem(APPLICATIONS_STORAGE_KEY);

    let jobsData: Work[] = savedJobs ? JSON.parse(savedJobs) : [];
    let applicationsData: Record<string, { status: ApplicationStatus; appliedDate: string }> = savedApplications ? JSON.parse(savedApplications) : {};

    // localStorage에 데이터가 없거나, INITIAL_JOBS의 완료된 작업들이 없는 경우 병합
    if (!savedJobs || jobsData.length === 0) {
      jobsData = INITIAL_JOBS;
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
    } else {
      // localStorage에 데이터가 있더라도, INITIAL_JOBS의 완료된 작업들(status: "done")은 항상 포함
      const existingIds = new Set(jobsData.map((job) => job.id));
      const completedJobsFromInitial = INITIAL_JOBS.filter(
        (job) => job.status === "done" && !existingIds.has(job.id)
      );
      if (completedJobsFromInitial.length > 0) {
        jobsData = [...jobsData, ...completedJobsFromInitial];
        localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobsData));
      }
    }

    if (savedApplications) {
      jobsData = jobsData.map((job) => {
        const application = applicationsData[job.id];
        return application ? { ...job, applicationStatus: application.status, appliedDate: application.appliedDate } : job;
      });
    }

    setJobs(jobsData);
    setApplications(applicationsData);
  }, []);

  // 지원하기 함수
  const applyToJob = useCallback((jobId: string) => {
    const today = new Date().toISOString().split("T")[0];
    
    setApplications((prev) => {
      const updated = { ...prev, [jobId]: { status: "pending" as ApplicationStatus, appliedDate: today } };
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setJobs((prevJobs) => {
      const updated = prevJobs.map((job) =>
        job.id === jobId ? { ...job, applicationStatus: "pending" as ApplicationStatus, appliedDate: today } : job
      );
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 지원 상태 업데이트 (승인/거절)
  const updateApplicationStatus = useCallback((jobId: string, status: ApplicationStatus) => {
    setApplications((prev) => {
      const updated = { ...prev, [jobId]: { ...prev[jobId], status } };
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setJobs((prevJobs) => {
      const updated = prevJobs.map((job) =>
        job.id === jobId ? { ...job, applicationStatus: status } : job
      );
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 지원한 일자리 목록 가져오기
  const getAppliedJobs = useCallback((): Work[] => {
    return jobs.filter((job) => job.applicationStatus !== undefined);
  }, [jobs]);

  // 지원하지 않은 일자리 목록 가져오기
  const getAvailableJobs = useCallback((): Work[] => {
    return jobs.filter((job) => job.applicationStatus === undefined);
  }, [jobs]);

  // 특정 ID로 일자리 찾기
  const getJobById = useCallback((id: string): Work | undefined => {
    return jobs.find((job) => job.id === id);
  }, [jobs]);

  return {
    jobs,
    applications,
    applyToJob,
    updateApplicationStatus,
    getAppliedJobs,
    getAvailableJobs,
    getJobById,
  };
};