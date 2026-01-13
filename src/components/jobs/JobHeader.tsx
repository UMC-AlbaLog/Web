import { useNavigate } from "react-router-dom";

const JobHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-end mb-4 px-2">
      <h3 className="text-xl font-black text-gray-800 leading-tight">
        내 시간표에 맞는 대타 추천
      </h3>
      <button 
        onClick={() => navigate("/jobs/status")}
        className="bg-white px-6 py-2.5 rounded-full text-[12px] font-black text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
      >
        지원 현황 보러가기
      </button>
    </div>
  );
};

export default JobHeader;