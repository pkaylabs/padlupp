// src/components/milestones/StreaksView.tsx
import React from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import streak from "@/assets/images/streak.png";

export const StreaksView: React.FC = () => {
  return (
    <motion.div
      className="flex flex-col items-center w-full mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Placeholder for user's flame image */}

      <img src={streak} alt="Streak" className="w-52 h-52" />

      <h2 className="text-xl font-semibold text-gray-700">12-Days Streak!</h2>
      <p className="text-gray-500 mt-2 text-center">
        Complete your daily goals to start a streak. <br /> Skip a day and it
        resets.
      </p>

      <div className="w-full max-w-md bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4 mt-8">
        <Flame
          strokeWidth={5}
          fill="#FFCE51"
          size={40}
          className="text-orange-500 drop-shadow-lg drop-shadow-orange-500"
        />

        <div>
          <span className="text-sm font-medium text-gray-600">
            Longest streak
          </span>
          <p className="text-lg font-bold text-[#263238] ">15 days</p>
        </div>
      </div>
    </motion.div>
  );
};
