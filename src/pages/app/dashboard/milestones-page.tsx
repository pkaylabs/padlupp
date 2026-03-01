import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { StreaksView } from "./components/streaks-view";
import { AwardsView } from "./components/awards-view";
import { cn } from "@/utils/cs";

type MilestoneTab = "streaks" | "awards";

export const MilestonesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MilestoneTab>("streaks");

  return (
    <div className="min-h-full bg-[#F4F4F6] dark:bg-slate-950 px-3 sm:px-6 py-6">
      <div className="relative max-w-4xl mx-auto">
        <button
          type="button"
          aria-label="Back"
          onClick={() => void navigate({ to: "/dashboard" })}
          className="absolute left-0 top-1 p-2 rounded-full hover:bg-gray-200/80 dark:hover:bg-slate-800 text-[#4A4A4A] dark:text-slate-200"
        >
          <ChevronLeft size={26} />
        </button>

        <h1 className="text-center text-2xl font-semibold text-[#5A5A5A] dark:text-slate-100">
          Milestones
        </h1>

        <div className="mx-auto mt-6 w-fit rounded-xl bg-[#D8E1EE] dark:bg-slate-800 p-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("streaks")}
              className={cn(
                "px-8 py-2 rounded-lg text-lg font-medium transition-colors",
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
                "px-8 py-2 rounded-lg text-lg font-medium transition-colors",
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
          <div className="w-full flex justify-center">
            {activeTab === "streaks" ? <StreaksView /> : <AwardsView />}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};
