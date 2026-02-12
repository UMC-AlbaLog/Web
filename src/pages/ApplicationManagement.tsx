import React, { useState, useMemo, useEffect, useRef } from "react";
import { useJobs } from "../hooks/useJobs";
import { formatTimeString, getUse24HourSetting } from "../utils/timeFormat";

type TabType = "all" | "inProgress" | "completed";

const ApplicationManagement: React.FC = () => {
  const { jobs: appliedJobs = [], loading, updateApplicationStatus } = useJobs({}); 
  
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const storeNames = useMemo(() => {
    const stores = new Set<string>();
    appliedJobs.forEach((job) => stores.add(job.name));
    return Array.from(stores).sort();
  }, [appliedJobs]);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "pending":
        return { text: "대기 중", color: "text-yellow-600 bg-yellow-50" };
      case "approved":
        return { text: "지원 승인", color: "text-green-600 bg-green-50" };
      case "rejected":
        return { text: "지원 거절", color: "text-red-600 bg-red-50" };
      default:
        return { text: "대기 중", color: "text-gray-600 bg-gray-50" };
    }
  };

  const filteredApplications = useMemo(() => {
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
    if (selectedStore) {
      filtered = filtered.filter((job) => job.name === selectedStore);
    }
    return filtered;
  }, [activeTab, searchQuery, selectedStore, appliedJobs]);

  const handleApprove = (jobId: string) => {
    if (window.confirm("이 지원을 승인하시겠습니까?")) {
      updateApplicationStatus?.(jobId, "approved");
    }
  };

  const handleReject = (jobId: string) => {
    if (window.confirm("이 지원을 거절하시겠습니까?")) {
      updateApplicationStatus?.(jobId, "rejected");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")} (${days[date.getDay()]})`;
    } catch { return dateString; }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    if (showFilter) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter]);

  return (
    <main className="p-10 bg-[#F8F9FA] flex-1 overflow-y-auto font-['Pretendard']">
      <div className="mb-8 text-left">
        <h1 className="text-[32px] font-black text-gray-900">대타 지원 관리</h1>
        <p className="text-gray-400 font-bold mt-2">사장님, 도착한 지원 현황을 확인하고 승인/거절을 결정하세요</p>
      </div>

      <div className="mb-8 flex">
        <button onClick={() => setActiveTab("all")} className={`px-8 py-4 text-sm font-black transition-all rounded-l-xl ${activeTab === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-400 border border-gray-100"}`}>전체</button>
        <button onClick={() => setActiveTab("inProgress")} className={`px-8 py-4 text-sm font-black transition-all border-y border-gray-100 ${activeTab === "inProgress" ? "bg-gray-900 text-white" : "bg-white text-gray-400"}`}>진행 중</button>
        <button onClick={() => setActiveTab("completed")} className={`px-8 py-4 text-sm font-black transition-all rounded-r-xl border border-gray-100 ${activeTab === "completed" ? "bg-gray-900 text-white" : "bg-white text-gray-400"}`}>관리 완료</button>
      </div>

      <div className="mb-8 flex gap-4">
        <div className="flex-1 relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="매장명 또는 주소로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-14 pr-6 py-4.5 text-[15px] font-bold text-gray-900 border border-gray-100 outline-none focus:ring-2 focus:ring-[#5D5FEF] shadow-sm"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="bg-white px-8 py-4.5 rounded-xl text-[15px] font-black text-gray-700 border border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            필터
          </button>
          {showFilter && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-5">
              <p className="text-xs text-gray-400 font-black mb-4 uppercase tracking-wider">매장별 보기</p>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                <button onClick={() => { setSelectedStore(null); setShowFilter(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedStore === null ? "bg-[#5D5FEF] text-white" : "hover:bg-gray-50 text-gray-600"}`}>전체 매장</button>
                {storeNames.map((store) => (
                  <button key={store} onClick={() => { setSelectedStore(store); setShowFilter(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedStore === store ? "bg-[#5D5FEF] text-white" : "hover:bg-gray-50 text-gray-600"}`}>{store}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="bg-white rounded-xl p-20 text-center text-gray-400 font-bold">지원 내역을 불러오는 중입니다...</div>
        ) : filteredApplications.map((job) => {
          const statusInfo = getStatusLabel(job.applicationStatus);
          const expectedPay = job.pay * job.duration;

          return (
            <div key={job.id} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-gray-800">{job.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black ${statusInfo.color}`}>{statusInfo.text}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-400 leading-relaxed">{job.address}</p>
                  <p className="text-sm font-black text-[#5D5FEF] bg-indigo-50 inline-block px-3 py-1 rounded-lg">
                    {formatDate(job.date)} | {formatTimeString(job.time, getUse24HourSetting())}
                  </p>
                </div>
                
                {job.applicationStatus === "pending" ? (
                  <div className="flex gap-3">
                    <button onClick={() => handleReject(job.id)} className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-7 py-3 rounded-xl font-black text-sm transition-all">거절하기</button>
                    <button onClick={() => handleApprove(job.id)} className="bg-[#5D5FEF] hover:bg-[#4A4BCF] text-white px-7 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 transition-all">지원 승인</button>
                  </div>
                ) : (
                  <div className={`px-5 py-3 rounded-xl font-black text-sm border ${job.applicationStatus === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {job.applicationStatus === "approved" ? "승인 완료" : "거절됨"}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-8 pt-6 border-t border-gray-50 text-left">
                <div><p className="text-[11px] text-gray-400 font-bold mb-1">시급</p><p className="text-lg font-black text-gray-800">{job.pay.toLocaleString()}원</p></div>
                <div className="w-px h-8 bg-gray-100" />
                <div><p className="text-[11px] text-gray-400 font-bold mb-1">예상 급여</p><p className="text-lg font-black text-[#5D5FEF]">{expectedPay.toLocaleString()}원</p></div>
                <div className="w-px h-8 bg-gray-100" />
                <div><p className="text-[11px] text-gray-400 font-bold mb-1">지원일</p><p className="text-sm font-bold text-gray-500">{job.appliedDate || "방금 전"}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredApplications.length === 0 && (
        <div className="bg-white rounded-xl p-24 text-center border border-dashed border-gray-200">
          <p className="text-gray-300 text-lg font-bold">
            {searchQuery || selectedStore ? "검색 결과와 일치하는 지원서가 없습니다." : "아직 도착한 지원서가 없네요."}
          </p>
        </div>
      )}
    </main>
  );
};

export default ApplicationManagement;