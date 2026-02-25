// src/components/layout/TopNav.tsx
import React, { useEffect, useState } from "react";
import { Bell, ChevronRight, User } from "lucide-react";
import Button from "@/components/core/buttons";
import { Modal } from "@/components/core/modal";
import { TimerModal } from "./timer-modal";
import { TimerStart } from "iconsax-reactjs";
import { ThemeToggle } from "./toggle-theme";
import { useUserProfile } from "@/pages/auth/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import {
  AppTheme,
  getResolvedTheme,
  getStoredThemePreference,
  setThemePreference,
} from "@/utils/theme";

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
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    getResolvedTheme(getStoredThemePreference()),
  );
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

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getResolvedTheme(getStoredThemePreference()));
    };

    syncTheme();
    window.addEventListener("theme-change", syncTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      const preference: AppTheme = getStoredThemePreference();
      if (preference === "system") {
        syncTheme();
      }
    };
    media.addEventListener("change", onMediaChange);

    return () => {
      window.removeEventListener("theme-change", syncTheme);
      media.removeEventListener("change", onMediaChange);
    };
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setThemePreference(newTheme);
  };

  return (
    <>
      <nav className="w-full h-full flex items-center justify-between gap-3 px-2 sm:px-6 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/settings" className="shrink-0">
            {userProfile?.user?.avatar ? (
              <img
                src={userProfile.user.avatar}
                alt="User"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-300 border border-gray-200 dark:border-slate-700 flex items-center justify-center">
                <User size={18} />
              </div>
            )}
          </Link>

          <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 min-w-0">
            <span className="text-xs sm:text-sm truncate text-gray-700 dark:text-slate-200">🔥 {longestStreak} days</span>
            <ChevronRight className="size-4 sm:size-5 shrink-0 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

          <button className="relative w-10 h-10 hidden sm:flex items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">
            <div className="absolute size-2 rounded-full bg-primary-500 top-2 right-3"></div>
            <Bell className="text-gray-300 dark:text-slate-500" size={24} />
          </button>

          {/* Set Timer Button */}
          <div className="flex-1 w-full ">
            <Button
              variant="primary"
              size="md"
              className="flex items-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-6"
              onClick={() => setIsTimerOpen(true)}
            >
              <span className="text-xs sm:text-sm">Set timer</span>
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
