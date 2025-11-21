// src/components/DateInput.tsx
import React from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface DateInputProps {
  value: Date | undefined;
}

export const DateInput: React.FC<DateInputProps> = ({ value }) => {
  // Format the date as 'dd-MM-yy' to match the screenshot's style
  const displayValue = value ? format(value, "dd-MM-yy") : "";

  return (
    <div className="flex items-center w-full px-3 py-2 bg-gray-100 rounded-md border border-gray-300">
      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
      <input
        type="text"
        placeholder="Select date"
        value={displayValue}
        readOnly
        className="bg-transparent text-sm text-gray-800 outline-none w-full"
      />
    </div>
  );
};
