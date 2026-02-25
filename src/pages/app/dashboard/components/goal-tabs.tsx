// src/components/dashboard/GoalTabs.tsx
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cs";

const tabs = ["All", "To-do", "In progress", "Completed"];

interface GoalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const GoalTabs: React.FC<GoalTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center border-b border-gray-200 dark:border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "relative px-4 py-3 text-sm font-medium transition-colors",
            activeTab === tab
              ? "text-primary-500"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          )}
        >
          {tab}
          {activeTab === tab && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
              layoutId="tab-underline"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};
