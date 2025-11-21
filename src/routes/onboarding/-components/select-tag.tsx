// src/components/onboarding/SelectableTag.tsx
import React from "react";
import { cn } from "@/utils/cs";
import { motion } from "framer-motion";

interface TagProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export const SelectableTag: React.FC<TagProps> = ({
  icon,
  label,
  isSelected,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 p-3 border rounded-lg transition-all duration-200",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-white hover:border-gray-400"
      )}
      whileTap={{ scale: 0.98 }}
    >
      <span className={isSelected ? "text-blue-600" : "text-gray-500"}>
        {icon}
      </span>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </motion.button>
  );
};
