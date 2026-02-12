// src/components/layout/TopNav.tsx
import React, { useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import Profile from "@/assets/images/profile.png";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { TimerModal } from "./timer-modal";
import { TimerStart } from "iconsax-reactjs";
import { ThemeToggle } from "./toggle-theme";
import { useUserProfile } from "@/pages/auth/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface LongestStreakResponse {
  longest_streak?: number;
  streak?: number;
  days?: number;
}

const resolveLongestStreak = (payload?: LongestStreakResponse): number => {
  if (!payload) return 0;
  const value = payload.longest_streak ?? payload.streak ?? payload.days ?? 0;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

export const TopNav: React.FC = () => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { data: userProfile } = useUserProfile();
  const { data: streakResponse } = useQuery({
    queryKey: ["longest-streak"],
    queryFn: async () => {
      const { data } = await api.get<LongestStreakResponse>(
        "/stats/longest-streak/",
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const longestStreak = resolveLongestStreak(streakResponse);

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
            <img
              src={userProfile?.user?.avatar || Profile}
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
            {/* Streak */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
              <span className="text-sm">🔥 {longestStreak} days</span>
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
