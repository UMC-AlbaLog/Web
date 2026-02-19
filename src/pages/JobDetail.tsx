import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useJobDetail } from "../hooks/useJobDetail";
import { albaService } from "../api/albaService";
import ApplyConfirmModal from "../components/jobs/ApplyConfirmModal";
import KakaoMap from "../components/KakaoMap";

const JobDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { job, loading } = useJobDetail(id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id && !loading && !job && location.pathname === "/jobs/from-status") {
      navigate("/jobs/status", { replace: true });
    }
  }, [id, loading, job, location.pathname, navigate]);

  const LocationIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline-block -mt-1">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );

  if (loading || !job) return (
    <div className="min-h-screen flex items-center justify-center font-['Pretendard'] font-bold text-gray-400">
      데이터를 불러오고 있습니다...
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-['Pretendard'] text-left p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_340px] gap-10 items-start">
        
        <main className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 space-y-12">
          <div className="space-y-5">
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-[#5D5FEF] text-white text-[11px] font-bold rounded-xl">{job.status}</span>
              <span className="px-2.5 py-1 bg-[#F2F4F7] text-gray-400 text-[11px] font-bold rounded-xl">{job.category}</span>
              <span className="px-2.5 py-1 bg-[#F2F4F7] text-gray-400 text-[11px] font-bold rounded-xl">{job.timeTag}</span>
            </div>
            <h1 className="text-[32px] font-black text-gray-900 leading-snug">{job.storeName} {job.notification || "대타 모집합니다"}</h1>
            <p className="text-gray-400 text-[15px] font-medium flex items-center">
              <LocationIcon /> {job.storeAddress || "등록된 주소 정보가 없습니다."}
            </p>
          </div>

          <section className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">근무 조건</h3>
            <div className="grid grid-cols-2 gap-y-10 border-t border-gray-100 pt-8 text-[16px]">
              <div><p className="text-gray-400 font-bold mb-2">급여</p><p className="font-black text-[#5D5FEF] text-lg">시급 {job.hourlyRate?.toLocaleString()}원</p></div>
              <div><p className="text-gray-400 font-bold mb-2">근무 기간</p><p className="font-bold text-gray-900 text-lg">단기 (대타)</p></div>
              <div><p className="text-gray-400 font-bold mb-2">근무 요일</p><p className="font-bold text-gray-900 text-lg">{job.dayOfWeek}요일</p></div>
              <div><p className="text-gray-400 font-bold mb-2">근무 시간</p><p className="font-bold text-gray-900 text-lg">{job.displayTime} ({job.workTime}시간)</p></div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">근무지 정보</h3>
              <button 
                onClick={() => navigate(`/review/view/${job.storeId}`, {
                  state: {
                    storeName: job.storeName,
                    realStoreId: job.storeId
                  }
                })}
                className="text-[15px] font-bold text-gray-500 hover:text-[#5D5FEF] transition-all flex items-center gap-1"
              >
                신뢰 지표 ⭐ {job.trustScore} <span className="text-[#5D5FEF] ml-1">→</span>
              </button>
            </div>
            <p className="text-gray-700 text-[15px] font-bold">{job.storeAddress || "주소 정보 없음"}</p>
              <div className="w-full h-80 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                {job.storeAddress ? (
                  <KakaoMap address={job.storeAddress} storeName={job.storeName} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-300">
                    주소 정보가 없어 지도를 불러올 수 없습니다
                  </div>
                )}
              </div>
          </section>

          <section className="space-y-10 border-t border-gray-100 pt-12">
            <h3 className="text-xl font-bold text-gray-900">상세 모집 내용</h3>
            <div className="space-y-12 text-gray-700 leading-relaxed text-[16px]">
              <div><p className="font-black text-gray-900 mb-3">[담당업무]</p><p className="font-medium whitespace-pre-wrap">{job.mainTask}</p></div>
              <div><p className="font-black text-gray-900 mb-3">[자격요건]</p><p className="font-medium whitespace-pre-wrap">{job.requirement}</p></div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-12 border-t border-gray-100">
            <button onClick={() => navigate(-1)} className="px-12 py-4 border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 text-lg">취소</button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-12 py-4 bg-[#5D5FEF] text-white font-bold rounded-xl text-lg hover:bg-[#4A4BCF] shadow-lg shadow-indigo-100"
            >
              지원하기
            </button>
          </div>
        </main>

        <aside className="sticky top-12 bg-white rounded-xl p-10 shadow-sm border border-gray-100 space-y-10 text-left">
          <div>
            <p className="text-gray-400 text-[13px] font-black mb-3 uppercase tracking-wide">예상 월 급여</p>
            <h3 className="text-[36px] font-black text-gray-900 leading-none">{job.totalWage?.toLocaleString()}<span className="text-2xl ml-1">원</span></h3>
          </div>
          
          <div className="space-y-5 pt-8 border-t border-gray-100 text-[15px]">
            <div className="flex justify-between items-center"><span className="text-gray-400 font-bold">시급</span><span className="font-black text-gray-900">{job.hourlyRate?.toLocaleString()}원</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 font-bold">근무 시간</span><span className="font-bold text-gray-900">일 {job.workTime}시간 ({job.dayOfWeek})</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 font-bold">주휴 수당</span><span className="font-black text-[#5D5FEF]">포함</span></div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full py-5 rounded-xl bg-[#5D5FEF] text-white font-bold text-[19px] hover:bg-[#4A4BCF] transition-transform active:scale-[0.98]"
          >
            지금 지원하기
          </button>
        </aside>
      </div>

      {isModalOpen && (
        <ApplyConfirmModal 
          job={job} 
          onClose={() => setIsModalOpen(false)}
          onConfirm={async () => {
            try {
              await albaService.applyAlba(id!); 
              alert("지원이 완료되었습니다.");
              navigate("/jobs/status");
            } catch (e) { 
              alert("이미 지원했거나 오류가 발생했습니다."); 
            }
          }} 
        />
      )}
    </div>
  );
};

export default JobDetail;