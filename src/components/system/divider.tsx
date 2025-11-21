import React from "react";

export const Divider: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-300" />
      </div>
      <span className="relative bg-white px-3 text-sm text-gray-500">
        {text}
      </span>
    </div>
  );
};
