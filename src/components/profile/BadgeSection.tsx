import React from "react";

interface Badge {
  id: string;
  name: string;
  icon: string;
  achieved: boolean;
}

interface BadgeSectionProps {
  badges: Badge[];
}

const BadgeSection: React.FC<BadgeSectionProps> = ({ badges }) => {
  const badgeColors: Record<string, { bg: string; icon: string }> = {
    clock: { bg: "bg-orange-100", icon: "text-orange-600" },
    lightning: { bg: "bg-blue-100", icon: "text-blue-600" },
    group: { bg: "bg-green-100", icon: "text-green-600" },
    weekend: { bg: "bg-orange-100", icon: "text-orange-600" },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-800">내 활동 뱃지</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => {
          const colors = badgeColors[badge.icon] || { bg: "bg-gray-100", icon: "text-gray-700" };

          return (
            <div
              key={badge.id}
              className="p-3 rounded-lg bg-white border border-gray-200 text-center shadow-sm"
            >
              <div className={`w-12 h-12 mx-auto mb-2 ${colors.bg} rounded-full flex items-center justify-center`}>
                {badge.icon === "clock" && (
                  <svg className={`w-6 h-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {badge.icon === "lightning" && (
                  <svg className={`w-6 h-6 ${colors.icon}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                )}
                {badge.icon === "group" && (
                  <svg className={`w-6 h-6 ${colors.icon}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                )}
                {badge.icon === "weekend" && (
                  <svg className={`w-6 h-6 ${colors.icon}`} fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="3.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10.5 10h1v6h-1v-6z" fill="currentColor"/>
                    <path d="M12.5 10h1v6h-1v-6z" fill="currentColor"/>
                    <path d="M9 16l1.5 2 1.5-2 1.5 2 1.5-2h-6z" fill="currentColor"/>
                    <path d="M8 18l2 3 2-3 2 3 2-3h-8z" fill="currentColor"/>
                  </svg>
                )}
              </div>
              <p className="text-xs font-medium text-gray-800 leading-tight">{badge.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeSection;



