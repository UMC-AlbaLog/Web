import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkForm } from "../hooks/useWorkForm"; 
import { useJobsData } from "../hooks/useJobsData"; 
import { useJobs } from "../hooks/useJobs";
import { calculateDistance } from "../utils/geo";
import JobBanner from "../components/jobs/JobBanner";
import JobCard from "../components/jobs/JobCard";
import JobHeader from "../components/jobs/JobHeader";
import JobFilterSidebar from "../components/jobs/JobFilterSidebar";

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const { states, setters, actions } = useWorkForm();
  const { userName, userLocation, freeSlot } = useJobsData(); 
  const { jobs, getAvailableJobs, applyToJob } = useJobs();
  const [filterDistance, setFilterDistance] = useState("1km");

  // 지원하지 않은 일자리만 표시
  const availableJobs = useMemo(() => getAvailableJobs(), [getAvailableJobs]);

  const handleApply = (jobId: string) => {
    applyToJob(jobId);
    // 지원 완료 후 상세 페이지로 이동하거나 알림 표시
    alert("지원이 완료되었습니다!");
  };

  return (
    <main className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto">
      <JobBanner userName={userName} freeSlot={freeSlot} />
      <JobHeader /> 
      <hr className="mb-8 border-gray-200" />

      <div className="flex gap-8 items-start">
        <JobFilterSidebar 
          states={states} setters={setters} actions={actions}
          filterDistance={filterDistance} setFilterDistance={setFilterDistance}
        />

        <section className="flex-1 space-y-6">
          {availableJobs.map((job) => {
            let distanceStr = "위치 확인 중...";
            if (userLocation && job.lat && job.lng) {
              const km = calculateDistance(userLocation.lat, userLocation.lng, job.lat, job.lng);
              const minutes = Math.round(km * 15);
              distanceStr = km < 1 ? `걸어서 ${minutes}분 (${Math.round(km * 1000)}m)` : `걸어서 ${minutes}분 (${km.toFixed(1)}km)`;
            }
            return (
              <JobCard 
                key={job.id} 
                job={job} 
                distanceStr={distanceStr} 
                onNavigate={(id) => navigate(`/jobs/${id}`)}
                onApply={() => handleApply(job.id)}
                hasApplied={job.applicationStatus !== undefined}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default Jobs;