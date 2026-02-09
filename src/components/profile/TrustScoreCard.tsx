import React from "react";

interface TrustScoreCardProps {
  trustScore: number | null;
  scoreAnimation: boolean;
}

const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  trustScore,
  scoreAnimation,
}) => {
  const displayScore = trustScore ?? 0;
  
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-sm text-white">
      <h3 className="text-base font-semibold mb-4">내 신뢰 지표*</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                strokeDasharray: `${2 * Math.PI * 54}`,
                strokeDashoffset: scoreAnimation
                  ? `${2 * Math.PI * 54 * (1 - displayScore / 100)}`
                  : `${2 * Math.PI * 54}`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold">{trustScore !== null ? trustScore : "-"}</p>
              <p className="text-sm">Score</p>
            </div>
          </div>
        </div>
      </div>
      {trustScore !== null ? (
        <div className="space-y-1 text-sm">
          <p>지각 3회 * 결근 0회</p>
          <p>성실도 상위 10프로 입니다.</p>
        </div>
      ) : (
        <div className="space-y-1 text-sm text-white/70">
          <p>신뢰 지표 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default TrustScoreCard;

