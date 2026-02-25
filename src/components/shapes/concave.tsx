// src/components/ConcaveShape.tsx
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cs";

interface ConcaveShapeProps {
  className?: string;
  children?: React.ReactNode;
}

export const ConcaveShape: React.FC<ConcaveShapeProps> = ({
  className,
  children,
}) => {
  return (
    <motion.div
      className={cn("relative w-full h-30 bg-gray-100 dark:bg-slate-800 shadow-xl", className)}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      style={{
        // This clip-path creates the concave top
        // We define the points of the shape, starting from the top-left (0% 0%)
        clipPath:
          "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 25% 15%, 50% 20%, 75% 15%, 100% 0%)",
        // A more simplified version if the above doesn't render correctly:
        // clipPath:
        //   "polygon(0% 0%, 25% 15%, 50% 20%, 75% 15%, 100% 0%, 100% 100%, 0% 100%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
        {children}
      </div>
    </motion.div>
  );
};

export default ConcaveShape;
