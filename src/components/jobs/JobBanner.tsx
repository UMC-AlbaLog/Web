interface JobBannerProps {
  userName: string;
  freeSlot: string;
}

const JobBanner: React.FC<JobBannerProps> = ({ userName, freeSlot }) => {

  return (
    <section className="bg-white rounded-[40px] p-10 mb-10 shadow-sm relative border border-white overflow-hidden">
      <h2 className="text-xl font-bold text-gray-800">
        이번 주, <span className="text-blue-600 font-black">{userName}</span>님을 위한 빈 시간대
      </h2>
      <p className="text-[#5D5FEF] font-black text-4xl mt-4">{freeSlot}</p>
      <p className="text-gray-400 text-sm font-medium mt-2">이 시간에 맞는 대타를 추천해 드려요</p>
    </section>
  );
};

export default JobBanner;