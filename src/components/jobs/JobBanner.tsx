import React from "react";

interface JobBannerProps {
  nickname: string;
  freeSlot: string;
}

const JobBanner: React.FC<JobBannerProps> = ({ nickname, freeSlot }) => {
  return (
    <section className="bg-white rounded-xl p-10 mb-10 shadow-sm border border-gray-50 text-left">
      <h2 className="font-pretendard font-semibold text-[18px] leading-[100%] align-middle mb-4">
        이번 주, <span>{nickname || "회원"}</span>님을 위한 빈 시간대
      </h2>

      <div className="inline-block border-b border-gray-200 pb-3 mb-1">
        <p className="text-gray-900 font-pretendard font-medium text-[16px] leading-[100%] align-middle">
          {freeSlot}
        </p>
      </div>
      <p className="text-gray-400 font-pretendard font-medium text-[13px] leading-[100%] align-middle mt-3">이 시간에 맞는 대타를 추천해 드려요</p>
    </section>
  );
};

export default JobBanner;