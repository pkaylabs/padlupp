// src/components/ui/Modal.tsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cs";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = false,
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalRoot(document.getElementById("modal-root"));
  }, []);

  if (!portalRoot) {
    if (process.env.NODE_ENV !== "production") {
      console.warn('Modal portal root "modal-root" not found in the DOM.');
    }
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          <motion.div
            className={cn(
              "relative z-10 bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-transparent dark:border-slate-700 w-full max-h-[90vh] overflow-y-auto",
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-[#153047] dark:text-slate-300 hover:text-gray-600 dark:hover:text-slate-100 z-20"
              >
                <X size={20} className="text-[#153047] dark:text-slate-300" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot
  );
};
