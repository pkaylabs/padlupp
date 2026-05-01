import { AnimatePresence, motion } from "framer-motion";

interface GoalActionsMenuProps {
  isOpen: boolean;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const GoalActionsMenu = ({
  isOpen,
  onEdit,
  onShare,
  onDelete,
}: GoalActionsMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute right-0 top-11 w-44 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-40 p-1.5"
        >
          <button
            type="button"
            onClick={onEdit}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Edit goal
          </button>
          <button
            type="button"
            onClick={onShare}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            Share goal
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Delete goal
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
