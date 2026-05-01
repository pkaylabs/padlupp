import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { StreaksView } from "./components/streaks-view";
import { AwardsView } from "./components/awards-view";
import { cn } from "@/utils/cs";
import { GOALS } from "@/constants/page-path";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface StreakStatsResponse {
  current_streak_count?: number;
  longest_streak_count?: number;
  longest_streak?: number;
  streak?: number;
  days?: number;
}

const getCurrentStreakCount = (payload?: StreakStatsResponse) => {
  const value = payload?.current_streak_count ?? 0;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const getLongestStreakCount = (payload?: StreakStatsResponse) => {
  const value =
    payload?.longest_streak_count ??
    payload?.longest_streak ??
    payload?.streak ??
    payload?.days ??
    0;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

type MilestoneTab = "streaks" | "awards";

export const MilestonesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MilestoneTab>("streaks");
  const { data: streakResponse } = useQuery({
    queryKey: ["streak-stats"],
    queryFn: async () => {
      const { data } = await api.get<StreakStatsResponse>(
        "/stats/longest-streak/",
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const currentStreakCount = getCurrentStreakCount(streakResponse);
  const longestStreakCount = getLongestStreakCount(streakResponse);

  return (
    <div className="min-h-full bg-[#F4F4F6] dark:bg-slate-950 px-3 sm:px-6 py-4 sm:py-6">
      <div className="relative max-w-4xl mx-auto">
        <button
          type="button"
          aria-label="Back"
          onClick={() => void navigate({ to: GOALS })}
          className="absolute left-0 top-0 sm:top-1 p-2 rounded-full hover:bg-gray-200/80 dark:hover:bg-slate-800 text-[#4A4A4A] dark:text-slate-200"
        >
          <ChevronLeft size={22} className="sm:w-6.5 sm:h-6.5" />
        </button>

        <h1 className="text-center text-xl sm:text-2xl font-semibold text-[#5A5A5A] dark:text-slate-100">
          Milestones
        </h1>

        <div className="mx-auto mt-5 w-full max-w-90 sm:w-fit rounded-lg bg-[#D8E1EE] dark:bg-slate-800 p-1">
          <div className="grid grid-cols-2 items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("streaks")}
              className={cn(
                "px-4 sm:px-8 py-1 rounded-lg text-sm sm:text-lg font-medium transition-colors",
                activeTab === "streaks"
                  ? "bg-primary-500 text-white"
                  : "text-[#4F5561] dark:text-slate-300",
              )}
            >
              Streaks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("awards")}
              className={cn(
                "px-4 sm:px-8 py-1 rounded-lg text-sm sm:text-lg font-medium transition-colors",
                activeTab === "awards"
                  ? "bg-primary-500 text-white"
                  : "text-[#4F5561] dark:text-slate-300",
              )}
            >
              Awards
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <div className="w-full flex justify-center px-1 sm:px-0">
            {activeTab === "streaks" ? (
              <StreaksView
                currentStreakCount={currentStreakCount}
                longestStreakCount={longestStreakCount}
              />
            ) : (
              <AwardsView />
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};
