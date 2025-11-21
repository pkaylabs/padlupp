// src/components/ui/StyledNumberInput.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface StyledNumberInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const StyledNumberInput: React.FC<StyledNumberInputProps> = ({
  value,
  onChange,
}) => {
  const increment = () => onChange(value + 1);
  const decrement = () => onChange(Math.max(0, value - 1)); // Prevent negative

  return (
    <div className="flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500"
      />
      <div className="flex flex-col ml-2">
        <button
          onClick={increment}
          className="w-6 h-5 flex items-center justify-center rounded-t border border-gray-300 bg-gray-50 hover:bg-gray-100"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={decrement}
          className="w-6 h-5 flex items-center justify-center rounded-b border border-b-gray-300 border-l-gray-300 border-r-gray-300 bg-gray-50 hover:bg-gray-100"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};
