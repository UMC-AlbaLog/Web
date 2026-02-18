import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkForm } from "../hooks/useWorkForm";
import { useJobs } from "../hooks/useJobs"; 
import { useJobsData } from "../hooks/useJobsData"; 
import { calculateDistance, getCoordsFromAddress } from "../utils/geo";
import JobBanner from "../components/jobs/JobBanner";
import JobHeader from "../components/jobs/JobHeader";
import JobFilterSidebar from "../components/jobs/JobFilterSidebar";
import JobCard from "../components/jobs/JobCard";

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const { states, setters, actions } = useWorkForm();
  const { nickname, freeSlot, userLocation } = useJobsData(); 
  const { jobs, loading } = useJobs(states); 

  const [coordsMap, setCoordsMap] = useState<Record<string, { lat: number; lng: number }>>({});

  useEffect(() => {
    const updateCoords = async () => {
      const newCoords = { ...coordsMap };
      let changed = false;

      for (const job of jobs) {
        if (job.address && job.address !== "주소 정보 없음" && !newCoords[job.address]) {
          const pos = await getCoordsFromAddress(job.address);
          if (pos) {
            newCoords[job.address] = pos;
            changed = true;
          }
        }
      }
      if (changed) setCoordsMap(newCoords);
    };

    if (jobs.length > 0) updateCoords();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const isSearchEmpty = !states.searchKeyword.trim();
    const isDistanceOff = !states.isDistanceActive;

    if (isSearchEmpty && isDistanceOff) {
      return jobs;
    }

    return jobs.filter((job) => {
      // 검색어 필터링
      const matchSearch = isSearchEmpty 
        ? true 
        : job.name.toLowerCase().includes(states.searchKeyword.toLowerCase());
      
      // 거리 필터링 (위치 정보 있을 때만)
      let matchDistance = true;
      if (states.isDistanceActive && userLocation && coordsMap[job.address]) {
        const coords = coordsMap[job.address];
        const dist = calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        matchDistance = dist <= states.distance;
      }
      
      return matchSearch && matchDistance;
    });
  }, [jobs, userLocation, coordsMap, states.distance, states.searchKeyword, states.isDistanceActive]);

  return (
    <main className="p-12 min-h-screen bg-[#F2F4F7] font-['Pretendard'] text-left">
      <div className="max-w-6xl mx-auto">
        <JobBanner nickname={nickname} freeSlot={freeSlot} />
        <div className="mb-1"><JobHeader /></div>

        <div className="flex gap-10 items-start">
          <JobFilterSidebar states={states} setters={setters} actions={actions} />
          
          <section className="flex-1 space-y-4">
            {loading ? (
              <div className="py-20 text-center animate-pulse text-gray-400 font-bold">대타를 찾는 중...</div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const coords = coordsMap[job.address];
                // km를 도보 시간으로 변환 (1km = 15분)
                const walkMin = userLocation && coords 
                  ? `걸어서 ${Math.ceil(calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng) * 15)}분`
                  : "거리 확인 중";

                return (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    distanceStr={walkMin} 
                    onNavigate={(id) => navigate(`/jobs/${id}`)} 
                  />
                );
              })
            ) : (
              <div className="py-32 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-300 font-bold">근처에 조건에 맞는 공고가 없어요.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Jobs;