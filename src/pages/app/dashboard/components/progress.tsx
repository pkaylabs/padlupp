// src/components/dashboard/TodayProgress.tsx
import React from "react";
import { motion } from "framer-motion";
import { format, isSameDay, startOfToday } from "date-fns";

interface TodayProgressProps {
  // We'll pass the goals for the selected day
  goals: { status: string }[];
  selectedDate: Date;
}

export const TodayProgress: React.FC<TodayProgressProps> = ({
  goals,
  selectedDate,
}) => {
  //   const completed = goals.filter((g) => g.status === "completed").length;
  const completed = 1;
  const total = goals.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Dynamically set the title
  const dateTitle = isSameDay(selectedDate, startOfToday())
    ? "Today"
    : format(selectedDate, "MMM d, yyyy");

  return (
    <div className="font-monts w-full">
      <div className="flex justify-between gap-3.5 items-center mb-2">
        <span className="text-sm font-medium text-gray-400">{dateTitle}</span>
        <div className="flex-1 w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-primary-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-sm font-medium text-gray-400">
          {progress}% complete
        </span>
      </div>
    </div>
  );
};
