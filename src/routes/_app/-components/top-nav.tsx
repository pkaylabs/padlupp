// src/components/layout/TopNav.tsx
import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Modal } from "@/components/core/modal";
import { Avatar } from "@/components/core/avatar";
import { ThemeToggle } from "./toggle-theme";
import { CommunityNotifications } from "./community-notifications";
import { TimerModal } from "./timer-modal";
import Button from "@/components/core/buttons";
import { useUserProfile } from "@/pages/auth/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AppTheme,
  getResolvedTheme,
  getStoredThemePreference,
  setThemePreference,
} from "@/utils/theme";
import { MILESTONES } from "@/constants/page-path";
import {
  getStreakStats,
  milestoneQueryKeys,
  type StreakStatsResponse,
} from "@/pages/app/dashboard/api/milestones";

const resolveCurrentStreak = (payload?: StreakStatsResponse): number => {
  if (!payload) return 0;
  const value = payload.current_streak_count ?? 0;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

export const TopNav: React.FC = () => {
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    getResolvedTheme(getStoredThemePreference()),
  );
  const { data: userProfile } = useUserProfile();
  const { data: streakResponse } = useQuery({
    queryKey: milestoneQueryKeys.streak,
    queryFn: getStreakStats,
    staleTime: 1000 * 60 * 5,
  });
  const currentStreak = resolveCurrentStreak(streakResponse);

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
      <nav aria-label="Account navigation" className="min-w-0 flex-1 h-full flex items-center justify-between gap-3 px-2 sm:px-6 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="shrink-0"
            onClick={() => setIsAvatarViewerOpen(true)}
          >
            <Avatar
              src={userProfile?.user?.avatar}
              name={userProfile?.user?.name}
              className="h-9 w-9 border border-gray-200 text-xs dark:border-slate-700 sm:h-10 sm:w-10"
            />
          </button>

          <Link
            to={MILESTONES}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 min-w-0"
          >
            <span className="text-xs sm:text-sm truncate text-gray-700 dark:text-slate-200">
              🔥 {currentStreak} days
            </span>
            <ChevronRight className="size-4 sm:size-5 shrink-0 text-gray-500 dark:text-slate-400" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

          <CommunityNotifications />
          <Button variant="primary" size="sm" aria-label="Set timer" onClick={() => setIsTimerOpen(true)} className="w-10 px-2 sm:w-auto sm:px-3 gap-2 font-medium"><span className="sr-only sm:not-sr-only">Set timer</span><img src="/pod-assets/timer.svg" alt="" /></Button>

          {/* Set Timer Button */}
          {/* <div className="flex-1 w-full ">
            <Button
              variant="primary"
              size="md"
              className="flex items-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-6"
              onClick={() => setIsTimerOpen(true)}
            >
              <span className="text-xs sm:text-sm">Set timer</span>
              <TimerStart size="20" color="#fff" />
            </Button>
          </div> */}
        </div>
      </nav>

      {/* The Modal itself */}
      {/* <Modal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        // This className is key for positioning
        className="fixed sm:top-15 sm:right-5 w-full sm:w-xl"
      >
        <TimerModal onClose={() => setIsTimerOpen(false)} />
      </Modal> */}

      <Modal
        isOpen={isAvatarViewerOpen}
        onClose={() => setIsAvatarViewerOpen(false)}
        showCloseButton
        className="max-w-2xl w-[92vw] p-4 md:p-6 top-1/2 -translate-y-1/2"
      >
        <div>
          <Avatar
            src={userProfile?.user?.avatar}
            name={userProfile?.user?.name}
            className="mx-auto h-[min(70vh,28rem)] w-[min(70vh,28rem)] text-6xl"
          />
          <div className="mt-4 flex justify-end">
            <Link
              to="/settings"
              onClick={() => setIsAvatarViewerOpen(false)}
              className="text-sm text-blue-600"
            >
              Open profile settings
            </Link>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} className="top-1/2 max-w-xl -translate-y-1/2"><TimerModal onClose={() => setIsTimerOpen(false)} /></Modal>
    </>
  );
};
