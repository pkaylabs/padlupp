import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cs";
import { CATEGORIES_MOCK } from "@/constants/goals-data";

interface CategoryGridViewProps {
  categories: typeof CATEGORIES_MOCK;
  onSelectCategory: (category: string) => void;
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <>
      <p className="-mt-1.5 mr-1.5 mb-3 text-sm font-medium text-gray-600">
        Categories
      </p>
      <motion.div
        className="grid grid-cols-3 gap-1 px-14"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {categories.map((item) => (
          <motion.button
            key={item.label}
            onClick={() => onSelectCategory(item.label)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:shadow transition-shadow"
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                item.color
              )}
            >
              <item.icon size={24} className={item.icon_color} />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {item.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </>
  );
};
