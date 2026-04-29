// src/components/onboarding/ProgressBar.tsx
import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
  maxAccessibleStep?: number;
  onStepSelect?: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  step,
  totalSteps,
  maxAccessibleStep = totalSteps,
  onStepSelect,
}) => {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full max-w-lg mb-12">
      <div className="h-1 bg-gray-200 rounded-full">
        <motion.div
          className="h-1 bg-[#4E92F4] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const itemStep = index + 1;
          const isActive = step === itemStep;
          const isCompleted = itemStep < step;
          const isLocked = itemStep > maxAccessibleStep;

          return (
            <button
              key={itemStep}
              type="button"
              disabled={isLocked}
              onClick={() => onStepSelect?.(itemStep)}
              className={`size-8 rounded-full text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-[#4E92F4] text-white"
                  : isCompleted
                    ? "bg-blue-100 text-[#4E92F4]"
                    : "bg-gray-100 text-gray-500"
              } ${isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {itemStep}
            </button>
          );
        })}
      </div>
    </div>
  );
};
