import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";
import MapModal from "../components/home/MapModal"; 
import ApplyConfirmModal from "../components/jobs/ApplyConfirmModal"; 

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, applyToJob } = useJobs();
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const job = getJobById(id || "");

  useEffect(() => {
    if (!job || !window.kakao) return;
    const { kakao } = window;
    kakao.maps.load(() => {
      const container = document.getElementById("small-map");
      if (!container) return;
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(job.address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          const map = new kakao.maps.Map(container, { center: coords, level: 4, draggable: false });
          new kakao.maps.Marker({ map, position: coords });
          map.setCenter(coords);
        }
      });
    });
  }, [job, id]);

  if (!job) return <div className="p-20 text-center font-black text-gray-400">공고 로딩 중...</div>;

  return (
    <main className="flex-1 bg-[#F3F4F6] p-10 overflow-y-auto text-left">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 매장 정보 상단 카드 */}
        <section className="bg-white rounded-[35px] p-10 shadow-sm border border-white">
          <p className="text-xs font-black text-blue-500 mb-1">매장명</p>
          <h2 className="text-3xl font-black text-gray-800 mb-6">{job.name}</h2>
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-xs text-gray-400 font-bold">근무 일시</p><p className="font-black text-gray-800">{job.date} | {job.time}</p></div>
            <div><p className="text-xs text-gray-400 font-bold">시급</p><p className="font-black text-gray-800">{job.pay.toLocaleString()}원</p></div>
            <div><p className="text-xs text-gray-400 font-bold">예상 급여</p><p className="font-black text-[#5D5FEF] text-xl">{job.expectedPay.toLocaleString()}원</p></div>
          </div>
        </section>

        {/* 지도 및 신뢰 지표 섹션 */}
        <section className="bg-white rounded-[35px] p-10 shadow-sm border border-white">
          <h3 className="text-lg font-black text-gray-800 mb-6">매장 정보</h3>
          <div className="flex gap-6 items-center">
            <div id="small-map" onClick={() => setIsMapOpen(true)} className="w-32 h-32 bg-gray-100 rounded-2xl cursor-pointer overflow-hidden border border-gray-100" />
            <div className="flex-1">
              <p className="font-black text-gray-800">[{job.name}]</p>
              <p className="text-sm text-gray-500 mb-4">{job.address}</p>
              <button onClick={() => setIsMapOpen(true)} className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-black text-gray-600">자세히 보기</button>
            </div>
            <div onClick={() => navigate(`/workplace/${job.id}`)} className="bg-gray-50 p-6 rounded-2xl text-center min-w-[140px] cursor-pointer hover:bg-yellow-50">
              <p className="text-2xl font-black text-gray-800">⭐ 4.8/5.0</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">신뢰 지표 (리뷰)</p>
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <button onClick={() => navigate(-1)} className="flex-1 bg-white py-5 rounded-3xl font-black text-gray-400 border border-gray-200">뒤로가기</button>
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className={`flex-1 py-5 rounded-3xl font-black text-white ${job.applicationStatus ? "bg-gray-300" : "bg-[#5D5FEF]"}`}
            disabled={!!job.applicationStatus}
          >
            {job.applicationStatus ? "지원 완료" : "지원하기"}
          </button>
        </div>
      </div>

      {isMapOpen && <MapModal title={job.name} address={job.address} onClose={() => setIsMapOpen(false)} />}
      {isApplyModalOpen && (
        <ApplyConfirmModal 
          job={job} 
          onConfirm={() => { applyToJob(job.id); setIsApplyModalOpen(false); navigate("/jobs/status"); }} 
          onClose={() => setIsApplyModalOpen(false)} 
        />
      )}
    </main>
  );
};

export default JobDetail;