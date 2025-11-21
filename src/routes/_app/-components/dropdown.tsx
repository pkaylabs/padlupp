// src/components/ui/StyledSelectInput.tsx
import React from "react";
import { ChevronDown } from "lucide-react";

// For this example, it's a styled-static select.
// You can replace this with Radix UI Select for a full-featured dropdown.
export const StyledSelectInput: React.FC = () => {
  return (
    <div className="relative w-40">
      <select className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 bg-white focus:border-blue-500 focus:ring-blue-500">
        <option>Basic syntax</option>
        <option>Variables</option>
        <option>Functions</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown size={16} />
      </div>
    </div>
  );
};
