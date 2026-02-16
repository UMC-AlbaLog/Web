import React from "react";

interface RatingRowProps {
  value: number;
  onChange: (v: number) => void;
}

const RatingRow: React.FC<RatingRowProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-5xl transition-all hover:scale-110 active:scale-90 ${
              star <= value ? 'text-[#FFD700]' : 'text-gray-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <p className="text-xl font-black text-gray-800">
        {value.toFixed(1)} <span className="text-gray-300">/ 5.0</span>
      </p>
    </div>
  );
};

export default RatingRow;