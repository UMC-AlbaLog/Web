import { useState, useEffect, useCallback } from "react";
import type { Work, ApplicationStatus } from "../types/work";

const JOBS_STORAGE_KEY = "jobs_list";
const APPLICATIONS_STORAGE_KEY = "applications";

// 초기 일자리 데이터
const INITIAL_JOBS: Work[] = [
  { 
    id: "101", 
    name: "GS25 영등포점", 
    address: "서울시 영등포구", 
    time: "10:00~13:30", 
    duration: 3.5, 
    pay: 11500, 
    expectedPay: 40250, 
    status: "upcoming", 
    date: "2026-01-15",
    lat: 37.5172, 
    lng: 126.9178 
  },
  { 
    id: "102", 
    name: "컴포즈커피 신길점", 
    address: "서울시 영등포구", 
    time: "17:00~22:00", 
    duration: 5, 
    pay: 11000, 
    expectedPay: 55000, 
    status: "upcoming", 
    date: "2026-01-16",
    lat: 37.5055, 
    lng: 126.9110 
  },
  { 
    id: "103", 
    name: "맥도날드 여의도점", 
    address: "서울시 영등포구", 
    time: "14:00~18:00", 
    duration: 4, 
    pay: 12000, 
    expectedPay: 48000, 
    status: "upcoming", 
    date: "2026-01-17",
    lat: 37.5219, 
    lng: 126.9243 
  },
  { 
    id: "104", 
    name: "스타벅스 당산점", 
    address: "서울시 영등포구", 
    time: "09:00~13:00", 
    duration: 4, 
    pay: 11500, 
    expectedPay: 46000, 
    status: "upcoming", 
    date: "2026-01-18",
    lat: 37.5345, 
    lng: 126.9021 
  },
];

export const useJobs = () => {
  const [jobs, setJobs] = useState<Work[]>([]);
  const [applications, setApplications] = useState<Record<string, { status: ApplicationStatus; appliedDate: string }>>({});

  // 초기 데이터 로드 및 동기화
  useEffect(() => {
    const savedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
    const savedApplications = localStorage.getItem(APPLICATIONS_STORAGE_KEY);

    let jobsData: Work[] = [];
    let applicationsData: Record<string, { status: ApplicationStatus; appliedDate: string }> = {};

    if (savedJobs) {
      jobsData = JSON.parse(savedJobs);
    } else {
      // 초기 데이터 저장
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
      jobsData = INITIAL_JOBS;
    }

    if (savedApplications) {
      applicationsData = JSON.parse(savedApplications);
      // applications 데이터를 jobs에 동기화
      jobsData = jobsData.map((job) => {
        const application = applicationsData[job.id];
        if (application) {
          return {
            ...job,
            applicationStatus: application.status,
            appliedDate: application.appliedDate,
          };
        }
        return job;
      });
      // 동기화된 데이터 저장
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobsData));
    }

    setJobs(jobsData);
    setApplications(applicationsData);
  }, []);

  // 지원하기
  const applyToJob = useCallback((jobId: string) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
    
    setApplications((prev) => {
      const updated = {
        ...prev,
        [jobId]: {
          status: "pending" as ApplicationStatus,
          appliedDate: today,
        },
      };
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Work 객체에도 applicationStatus 업데이트
    setJobs((prevJobs) => {
      const updated = prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, applicationStatus: "pending" as ApplicationStatus, appliedDate: today }
          : job
      );
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 지원 상태 업데이트 (관리자용 - 승인/거절)
  const updateApplicationStatus = useCallback((jobId: string, status: ApplicationStatus) => {
    setApplications((prev) => {
      const updated = {
        ...prev,
        [jobId]: {
          ...prev[jobId],
          status,
        },
      };
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

  // 특정 일자리 가져오기
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

