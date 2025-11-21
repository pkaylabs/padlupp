// src/components/ui/SegmentedControl.tsx
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cs";

interface SegmentedControlProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
  icons?: React.ReactNode[];
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  icons,
}) => {
  return (
    <div
      className={cn(
        "flex w-fit space-x-1 rounded-lg bg-primary-100/50 p-1",
        className
      )}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "relative flex items-center gap-2 rounded-md px-5 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab
              ? "text-white"
              : "text-gray-600 hover:text-gray-800"
          )}
        >
          {activeTab === tab && (
            <motion.div
              className="absolute inset-0 z-0 rounded-md bg-primary-500"
              layoutId="segmented-control-bg"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
          {/* Add icon if provided */}
          {icons && icons[index] && (
            <span className="relative z-10">{icons[index]}</span>
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
};
