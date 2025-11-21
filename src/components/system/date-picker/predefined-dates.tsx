// src/components/PredefinedDates.tsx
import React from "react";
import { DateRange } from "react-day-picker";

interface PredefinedDateOption {
  label: string;
  range: DateRange | undefined;
  secondary: string;
}

interface PredefinedDatesProps {
  options: PredefinedDateOption[];
  onSelect: (range: DateRange | undefined) => void;
}

export const PredefinedDates: React.FC<PredefinedDatesProps> = ({
  options,
  onSelect,
}) => {
  return (
    <ul className="space-y-1">
      {options.map((option) => (
        <li key={option.label}>
          <button
            onClick={() => onSelect(option.range)}
            className="flex justify-between items-center w-full px-3 py-1.5 rounded-md hover:bg-gray-100 text-sm"
          >
            <span className="text-gray-800">{option.label}</span>
            <span className="text-gray-500">{option.secondary}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};
