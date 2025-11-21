// src/components/ui/ThemeToggle.tsx
import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/utils/cs"; // Assuming your 'cn' utility path

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
}) => {
  const isDarkMode = theme === "dark";

  return (
    <button
      onClick={onToggle}
      // Using the exact dimensions from your screenshot
      className="relative flex items-center w-17 h-9 rounded-full bg-gray-100 p-1"
    >
      <motion.div
        className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow"
        animate={{ x: isDarkMode ? 0 : 32 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />

      {/* This container holds the icons. 
        It sits on top of the animated circle with z-10.
      */}
      <div className="relative z-10 flex flex-1 justify-between">
        {/* Moon Icon */}
        <span className="w-7 h-7 flex items-center justify-center">
          <Moon
            size={16}
            className={cn(
              "transition-colors",
              isDarkMode ? "text-gray-800" : "text-gray-400"
            )}
          />
        </span>

        {/* Sun Icon */}
        <span className="w-7 h-7 flex items-center justify-center">
          <Sun
            size={16}
            className={cn(
              "transition-colors",
              isDarkMode ? "text-gray-400" : "text-blue-500"
            )}
          />
        </span>
      </div>
    </button>
  );
};
