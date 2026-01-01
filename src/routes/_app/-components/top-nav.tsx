// src/components/layout/TopNav.tsx
import React, { useState } from "react";
import { Sun, Moon, Bell, ChevronRight } from "lucide-react";
import Logo from "@/assets/images/logo.png";
import Profile from "@/assets/images/profile.png";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { TimerModal } from "./timer-modal";
import { TimerStart } from "iconsax-reactjs";
import { ThemeToggle } from "./toggle-theme";

export const TopNav: React.FC = () => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <>
      <nav className="w-full h-full flex items-center justify-between px-4 sm:px-6 bg-white ">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {/* User Avatar */}
            <img src={Profile} alt="User" className="w-10 h-10 rounded-full" />
            {/* Streak */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
              <span className="text-sm">🔥 12 days</span>
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

          <button className="relative w-10 h-10 hidden sm:flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100">
            <div className="absolute size-2 rounded-full bg-primary-500 top-2 right-3"></div>
            <Bell className="text-gray-300" size={24} />
          </button>

          {/* Set Timer Button */}
          <div className="flex-1 w-full ">
            <Button
              variant="primary"
              size="md" // Use the size from your CVA
              className="flex items-center gap-1.5 py-2.5 px-6" // Adjust padding to match 'md'
              onClick={() => setIsTimerOpen(true)}
            >
              <span className="text-sm">Set timer</span>
              <TimerStart size="20" color="#fff" />
            </Button>
          </div>
        </div>
      </nav>

      {/* The Modal itself */}
      <Modal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        // This className is key for positioning
        className="fixed sm:top-15 sm:right-5 w-full sm:w-xl"
      >
        <TimerModal onClose={() => setIsTimerOpen(false)} />
      </Modal>
    </>
  );
};
