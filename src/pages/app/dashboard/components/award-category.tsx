// src/components/milestones/AwardCategory.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cs";

interface AwardCategoryProps {
  title: string;
  children: React.ReactNode;
}

export const AwardCategory: React.FC<AwardCategoryProps> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 bg-primary-100 rounded-t-xl"
      >
        <span className="text-black">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
          <ChevronRight size={20} className="text-gray-600" />
        </motion.div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
