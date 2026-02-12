import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";
import type { Work } from "../types/work";
import { getAlbaStatus, type AlbaStatusItem } from "../api/albaStatus";

type TabType = "all" | "inProgress" | "completed";

const IN_PROGRESS_STATUS = ["pending", "active", "대기중"];
const COMPLETED_STATUS = ["approved", "rejected", "closed", "지원승인", "지원거절"];

const ApplicationStatusPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { jobs: allJobs = [], loading: jobsLoading } = useJobs({}); 
  
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [apiItemsAll, setApiItemsAll] = useState<AlbaStatusItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const hasToken = typeof window !== "undefined" ? !!sessionStorage.getItem("accessToken") : false;
  const useApi = Boolean(hasToken);

  useEffect(() => {
    if (!useApi) return;
    setApiLoading(true);
    getAlbaStatus("all")
      .then(setApiItemsAll)
      .catch(() => setApiItemsAll([]))
      .finally(() => setApiLoading(false));
  }, [useApi]);

  const appliedJobs = useMemo(() => allJobs, [allJobs]);

  const getStatusLabel = (status?: string) => {
    const s = status?.toLowerCase() ?? "";
    const raw = status?.trim() ?? "";
    if (raw === "대기중" || s === "pending" || s === "active")
      return { text: "대기중", color: "text-yellow-600 bg-yellow-50" };
    if (raw === "지원승인" || s === "approved")
      return { text: "승인됨", color: "text-green-600 bg-green-50" };
    if (raw === "지원거절" || s === "rejected")
      return { text: "거절됨", color: "text-red-600 bg-red-50" };
    if (s === "closed") return { text: "모집완료", color: "text-gray-600 bg-gray-50" };
    return { text: status || "대기중", color: "text-gray-600 bg-gray-50" };
  };

  const filteredApiItems = useMemo((): AlbaStatusItem[] => {
    let list = apiItemsAll;
    if (activeTab === "inProgress") {
      list = list.filter((item) =>
        IN_PROGRESS_STATUS.includes(item.processStatus?.toLowerCase() ?? "")
      );
    } else if (activeTab === "completed") {
      list = list.filter((item) =>
        COMPLETED_STATUS.includes(item.processStatus?.toLowerCase() ?? "")
      );
    }
    if (searchQuery.trim()) {
      list = list.filter((item) =>
        item.storeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [apiItemsAll, activeTab, searchQuery]);

  const filteredLocalJobs = useMemo((): Work[] => {
    let filtered = appliedJobs;
    if (activeTab === "inProgress") {
      filtered = filtered.filter((job) => job.applicationStatus === "pending");
    } else if (activeTab === "completed") {
      filtered = filtered.filter(
        (job) => job.applicationStatus === "approved" || job.applicationStatus === "rejected"
      );
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [activeTab, searchQuery, appliedJobs]);

  const listToShow = useApi ? filteredApiItems : filteredLocalJobs;
  const isEmpty = listToShow.length === 0;
  const isLoading = apiLoading || jobsLoading;

  return (
    <main className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto font-['Pretendard']">
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

      <div className="mb-6 flex">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 text-sm font-black transition-all rounded-l-xl ${
            activeTab === "all" ? "bg-gray-800 text-white" : "bg-white text-gray-800 border border-gray-200"
          }`}
        >전체</button>
        <button
          onClick={() => setActiveTab("inProgress")}
          className={`px-6 py-3 text-sm font-black transition-all border-y border-gray-200 ${
            activeTab === "inProgress" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-800 border-l-0"
          }`}
        >진행 중</button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 text-sm font-black transition-all rounded-r-xl border border-gray-200 ${
            activeTab === "completed" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-800 border-l-0"
          }`}
        >모집 완료</button>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="매장명으로 검색하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 font-bold shadow-sm">
          지원 현황을 불러오는 중입니다...
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4">
          {listToShow.map((item: any, index) => {
            const statusInfo = getStatusLabel(useApi ? (item as AlbaStatusItem).processStatus : (item as Work).applicationStatus);
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all flex justify-between items-center"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-gray-800">{useApi ? item.storeName : item.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-400">
                    {useApi ? `${item.workDate} (${item.dayOfWeek})` : `${item.date} | ${item.time}`}
                  </p>
                  {useApi && <p className="text-sm font-bold text-gray-400">{item.startTime} ~ {item.endTime}</p>}
                </div>
                <button
                  onClick={() => navigate(`/jobs/${useApi ? index : item.id}`)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black text-sm transition-all"
                >
                  상세보기
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && isEmpty && (
        <div className="bg-white rounded-xl p-20 text-center shadow-sm border border-gray-100">
          <p className="text-gray-400 text-lg font-bold mb-6">
            {searchQuery ? "검색 결과가 없습니다." : "아직 지원한 내역이 없어요."}
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-[#5D5FEF] text-white px-8 py-4 rounded-xl font-black hover:bg-[#4A4BCF] transition-all shadow-lg shadow-indigo-100"
          >
            일자리 보러가기
          </button>
        </div>
      )}
    </main>
  );
};

export default ApplicationStatusPage;