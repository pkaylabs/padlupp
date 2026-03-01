// src/components/milestones/Badge.tsx
import React from "react";
import { cn } from "@/utils/cs";

interface BadgeProps {
  label: string;
  unlocked: boolean;
  // User will pass their image src here
  imageUrl: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, unlocked, imageUrl }) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center gap-2 text-center",
        !unlocked && "opacity-30"
      )}
    >
      {/* Placeholder for user's image */}
      <div className="w-full flex items-center justify-center">
        <img
          src={imageUrl}
          alt={label}
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300 leading-tight">
        {label}
      </span>
    </div>
  );
};
