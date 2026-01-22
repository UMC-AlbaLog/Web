import React from "react";

interface RatingRowProps {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  disabled?: boolean;
}

const RatingRow: React.FC<RatingRowProps> = ({ label, value, onChange, disabled }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-bold text-gray-500">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange?.(star)}
          className={`text-2xl transition-all ${
            star <= Math.round(value) ? 'text-yellow-400' : 'text-gray-200'
          } ${!disabled && 'hover:scale-125'}`}
        >
          ★
        </button>
      ))}
    </div>
  </div>
);

export default RatingRow;