// src/components/ui/StyledSwitch.tsx
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cs";

interface StyledSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const StyledSwitch: React.FC<StyledSwitchProps> = ({
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex w-10 h-5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-blue-500" : "bg-gray-300"
      )}
    >
      <motion.span
        className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        style={{ x: checked ? "100%" : "0%" }}
      />
    </button>
  );
};
