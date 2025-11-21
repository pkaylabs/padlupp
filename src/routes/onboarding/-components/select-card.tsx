// src/components/onboarding/SelectableCard.tsx
import React from "react";
import { cn } from "@/utils/cs";
import { motion } from "framer-motion";

interface CardProps {
  emoji: string;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export const SelectableCard: React.FC<CardProps> = ({
  emoji,
  title,
  description,
  isSelected,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center w-full space-x-4 p-5 border rounded-lg text-left transition-all duration-200",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-white hover:border-gray-400"
      )}
      whileTap={{ scale: 0.99 }}
    >
      <div className="text-3xl">{emoji}</div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.button>
  );
};
