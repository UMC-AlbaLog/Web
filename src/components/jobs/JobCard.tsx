import type { Work } from "../../types/work";

interface JobCardProps {
  job: Work;
  distanceStr: string;
  onNavigate: (id: string) => void;
  onApply?: () => void;
  hasApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, distanceStr, onNavigate, onApply, hasApplied }) => (
  <div className="bg-white p-8 rounded-[35px] shadow-sm border border-white flex justify-between items-center group hover:shadow-md transition-all">
    <div className="space-y-2">
      <span className="text-[10px] font-black text-blue-500 uppercase">[{job.status}] 시급 {job.pay.toLocaleString()}원</span>
      <h3 className="text-2xl font-black text-gray-800">{job.name}</h3>
      <p className="text-sm font-bold text-gray-400">{job.date} | {job.time}</p>
      <div className="flex items-center gap-2 text-[#5D5FEF] font-black text-xs">
        <span>시급 {job.pay.toLocaleString()}원</span>
        <span className="text-gray-300">|</span>
        <span className={distanceStr !== "위치 확인 중..." ? "text-blue-600" : "text-gray-300"}>{distanceStr}</span>
      </div>
    </div>
    <div className="flex gap-3">
      {hasApplied ? (
        <button 
          onClick={() => onNavigate(job.id)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-10 py-5 rounded-[20px] font-black text-sm active:scale-95 transition-all"
        >
          지원완료
        </button>
      ) : (
        <>
          <button 
            onClick={() => onNavigate(job.id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-5 rounded-[20px] font-black text-sm active:scale-95 transition-all"
          >
            상세보기
          </button>
          {onApply && (
            <button 
              onClick={onApply}
              className="bg-[#5D5FEF] hover:bg-[#4A4BCF] text-white px-10 py-5 rounded-[20px] font-black text-sm active:scale-95 transition-all"
            >
              지원하기
            </button>
          )}
        </>
      )}
    </div>
  </div>
);

export default JobCard;