import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkForm } from "../hooks/useWorkForm"; 
import { useJobsData } from "../hooks/useJobsData";
import { calculateDistance } from "../utils/geo";
import JobBanner from "../components/jobs/JobBanner";
import JobCard from "../components/jobs/JobCard";
import JobHeader from "../components/jobs/JobHeader";
import JobFilterSidebar from "../components/jobs/JobFilterSidebar";
import type { Work } from "../types/work";

const ALL_JOBS: Work[] = [
  { id: 101, name: "GS25 영등포점", address: "영등포구", time: "10:00~13:30", duration: 3.5, pay: 11500, expectedPay: 40250, status: "upcoming", date: "2026-01-13", lat: 37.5172, lng: 126.9178 },
  { id: 102, name: "컴포즈커피 신길점", address: "영등포구", time: "17:00~22:00", duration: 5, pay: 11000, expectedPay: 55000, status: "upcoming", date: "2026-01-13", lat: 37.5055, lng: 126.9110 },
];

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const { states, setters, actions } = useWorkForm();
  const { userName, userLocation, freeSlot } = useJobsData();
  const [filterDistance, setFilterDistance] = useState("1km");

  const onKeywordChange = (val: string) => {
    setters.setSearchKeyword(val);
    if (val.trim().length > 0) actions.handleSearch(val);
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
          onKeywordChange={onKeywordChange}
        />

        <section className="flex-1 space-y-6">
          {ALL_JOBS.map((job) => {
            let distanceStr = "위치 확인 중...";
            if (userLocation && job.lat && job.lng) {
              const km = calculateDistance(userLocation.lat, userLocation.lng, job.lat, job.lng);
              const minutes = Math.round(km * 15);
              distanceStr = km < 1 ? `걸어서 ${minutes}분 (${Math.round(km * 1000)}m)` : `걸어서 ${minutes}분 (${km.toFixed(1)}km)`;
            }
            return <JobCard key={job.id} job={job} distanceStr={distanceStr} onNavigate={(id) => navigate(`/jobs/${id}`)} />;
          })}
        </section>
      </div>
    </main>
  );
};

export default Jobs;