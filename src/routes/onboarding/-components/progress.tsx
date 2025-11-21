// src/components/onboarding/ProgressBar.tsx
import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  step,
  totalSteps,
}) => {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full max-w-lg h-1 bg-gray-200 rounded-full mb-16">
      <motion.div
        className="h-1 bg-[#4E92F4] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
};
