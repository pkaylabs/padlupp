// src/components/milestones/Badge.tsx
import React from "react";
import { cn } from "@/utils/cs";
import { Check, LockKeyhole } from "lucide-react";

interface BadgeProps {
  label: string;
  description: string;
  unlocked: boolean;
  imageUrl: string;
  current: number;
  target: number;
  unlockedAt: string | null;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  description,
  unlocked,
  imageUrl,
  current,
  target,
  unlockedAt,
}) => {
  const status = unlocked
    ? `Unlocked${unlockedAt ? ` on ${new Date(unlockedAt).toLocaleDateString()}` : ""}`
    : target > 1
      ? `${current}/${target}`
      : "Locked";

  return (
    <div
      className="group relative flex w-full flex-col items-center gap-2 rounded-lg px-1 py-2 text-center"
      title={`${description} ${status}.`}
      aria-label={`${label}. ${description} ${status}.`}
    >
      <div className="relative flex w-full items-center justify-center">
        <img
          src={imageUrl}
          alt={label}
          className={cn(
            "h-16 w-16 object-contain transition sm:h-20 sm:w-20",
            !unlocked && "grayscale opacity-35",
          )}
        />
        <span
          className={cn(
            "absolute bottom-0 right-[calc(50%-2rem)] flex h-5 w-5 items-center justify-center rounded-full sm:right-[calc(50%-2.5rem)]",
            unlocked
              ? "bg-emerald-500 text-white"
              : "border border-gray-300 bg-white text-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
          )}
          aria-hidden="true"
        >
          {unlocked ? <Check size={13} strokeWidth={3} /> : <LockKeyhole size={11} />}
        </span>
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300 leading-tight">
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] leading-tight",
          unlocked
            ? "font-medium text-emerald-600 dark:text-emerald-400"
            : "text-gray-500 dark:text-slate-400",
        )}
      >
        {status}
      </span>
    </div>
  );
};
