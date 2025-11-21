// src/components/milestones/Badge.tsx
import React from "react";
import { Award } from "lucide-react";
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
        "w-full flex flex-col items-center gap-2",
        !unlocked && "opacity-30"
      )}
    >
      {/* Placeholder for user's image */}
      <div className="w-full flex items-center justify-center">
        <img src={imageUrl} alt={label} className="w-20 h-20 object-contain" />
      </div>
      <span className="text-sm font-medium text-nowrap text-gray-700">
        {label}
      </span>
    </div>
  );
};
