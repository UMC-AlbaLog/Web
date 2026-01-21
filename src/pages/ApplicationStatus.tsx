import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";
import type { ApplicationStatus } from "../types/work";

type TabType = "all" | "inProgress" | "completed";

const ApplicationStatus: React.FC = () => {
  const navigate = useNavigate();
  const { getAppliedJobs } = useJobs();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const appliedJobs = useMemo(() => getAppliedJobs(), [getAppliedJobs]);

  const getStatusLabel = (status?: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return { text: "대기중", color: "text-yellow-600 bg-yellow-50" };
      case "approved":
        return { text: "승인됨", color: "text-green-600 bg-green-50" };
      case "rejected":
        return { text: "거절됨", color: "text-red-600 bg-red-50" };
      default:
        return { text: "대기중", color: "text-gray-600 bg-gray-50" };
    }
  };

  const filteredApplications = useMemo(() => {
    let filtered = appliedJobs;

    // 탭 필터링
    if (activeTab === "inProgress") {
      filtered = filtered.filter((job) => job.applicationStatus === "pending");
    } else if (activeTab === "completed") {
      filtered = filtered.filter(
        (job) => job.applicationStatus === "approved" || job.applicationStatus === "rejected"
      );
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, searchQuery, appliedJobs]);

  return (
    <main className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate("/jobs")}
          className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2 font-medium"
        >
          <span>←</span> 아르바이트 목록으로
        </button>
        <h1 className="text-3xl font-black text-gray-800">지원 현황</h1>
        <p className="text-gray-500 text-sm mt-2">내가 지원한 일자리 현황을 확인하세요</p>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 text-sm font-black transition-all rounded-l-xl ${
            activeTab === "all"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setActiveTab("inProgress")}
          className={`px-6 py-3 text-sm font-black transition-all border-y border-gray-200 ${
            activeTab === "inProgress"
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-800 border-l-0"
          }`}
        >
          진행 중
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 text-sm font-black transition-all rounded-r-xl border border-gray-200 ${
            activeTab === "completed"
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-800 border-l-0"
          }`}
        >
          모집 완료
        </button>
      </div>

      {/* 검색창과 필터 */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 19L14.65 14.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="검색창"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <button className="bg-white px-6 py-4 rounded-xl text-sm font-black text-gray-800 border border-gray-200 hover:bg-gray-50 transition-all">
          필터
        </button>
      </div>

      {/* 지원서 목록 */}
      <div className="space-y-4">
        {filteredApplications.map((job) => {
          const statusInfo = getStatusLabel(job.applicationStatus);
          const expectedPay = job.pay * job.duration;

          return (
            <div
              key={job.id}
              className="bg-white rounded-[35px] p-8 shadow-sm border border-white hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-gray-800">{job.name}</h3>
                    {job.applicationStatus && (
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-400 mb-1">{job.address}</p>
                  <p className="text-sm font-bold text-gray-400">
                    {job.date} | {job.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">시급</p>
                    <p className="text-lg font-black text-gray-800">
                      {job.pay.toLocaleString()}원
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">예상 급여</p>
                    <p className="text-lg font-black text-[#5D5FEF]">
                      {expectedPay.toLocaleString()}원
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">지원일</p>
                    <p className="text-sm font-bold text-gray-600">
                      {job.appliedDate || "N/A"}
                    </p>
                  </div>
                </div>

                {job.applicationStatus === "approved" && (
                  <button 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="bg-[#5D5FEF] hover:bg-[#4A4BCF] text-white px-6 py-3 rounded-[20px] font-black text-sm active:scale-95 transition-all"
                  >
                    상세보기
                  </button>
                )}
                {job.applicationStatus === "rejected" && (
                  <button 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-[20px] font-black text-sm active:scale-95 transition-all"
                  >
                    다시 지원하기
                  </button>
                )}
                {job.applicationStatus === "pending" && (
                  <button 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-[20px] font-black text-sm active:scale-95 transition-all"
                  >
                    상세보기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className="bg-white rounded-[35px] p-16 text-center">
          <p className="text-gray-400 text-lg font-medium mb-4">
            {searchQuery ? "검색 결과가 없습니다" : "아직 지원한 일자리가 없습니다"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate("/jobs")}
              className="bg-[#5D5FEF] hover:bg-[#4A4BCF] text-white px-8 py-4 rounded-[20px] font-black text-sm active:scale-95 transition-all"
            >
              일자리 보러가기
            </button>
          )}
        </div>
      )}
    </main>
  );
};

export default ApplicationStatus;
