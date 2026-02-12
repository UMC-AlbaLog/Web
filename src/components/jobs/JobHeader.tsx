import { useNavigate } from "react-router-dom";

const JobHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-end mb-8 px-2">
      <h3 className="font-pretendard font-semibold text-[18px] leading-[100%] align-middle mb-1">
        내 시간표에 맞는 대타 추천
      </h3>
      <button 
        onClick={() => navigate("/jobs/status")}
        className="bg-white border border-gray-100 rounded-md px-5 py-2.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 shadow-sm transition-all"
      >
        지원 현황 보러가기
      </button>
    </div>
  );
};

export default JobHeader;