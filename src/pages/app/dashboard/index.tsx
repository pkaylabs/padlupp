// src/pages/DashboardPage.tsx
import React, { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isSameDay, addDays, subDays, startOfToday, format } from "date-fns";
import { CalendarWidget } from "./components/calendar-widget";
import { GoalCard } from "./components/goal-card";
import { GoalTabs } from "./components/goal-tabs";
import { TodayProgress } from "./components/progress";
import { DASHBOARD } from "@/constants/page-path";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { StreaksView } from "./components/streaks-view";
import { AwardsView } from "./components/awards-view";
import { SegmentedControl } from "@/components/system/segment-control";

const today = startOfToday();
const ALL_GOALS = [
  // Today's Goals (Nov 8, 2025)
  {
    id: 1,
    title: "Basic Syntax & Variables",
    subtitle: "Learning Python",
    timeLeft: "12 Min Left",
    status: "inProgress" as const,
    categories: ["Regular", "Career building"],
    date: today, // Today
    time: "01:40 pm",
  },
  {
    id: 45,
    title: "Basic Syntax & Variables",
    subtitle: "Learning Python",
    timeLeft: "12 Min Left",
    status: "inProgress" as const,
    categories: ["Regular", "Career building"],
    date: today, // Today
    time: "01:40 pm",
  },
  {
    id: 33,
    title: "Basic Syntax & Variables",
    subtitle: "Learning Python",
    timeLeft: "12 Min Left",
    status: "inProgress" as const,
    categories: ["Regular", "Career building"],
    date: today, // Today
    time: "01:40 pm",
  },
  {
    id: 2,
    title: "Review PRD",
    subtitle: "Product Design",
    timeLeft: "30 Min Left",
    status: "todo" as const,
    categories: ["Regular"],
    date: today, // Today
    time: "10:00 am",
  },
  {
    id: 23,
    title: "Review PRD",
    subtitle: "Product Design",
    timeLeft: "30 Min Left",
    status: "todo" as const,
    categories: ["Regular"],
    date: today, // Today
    time: "10:00 am",
  },
  {
    id: 22,
    title: "Review PRD",
    subtitle: "Product Design",
    timeLeft: "30 Min Left",
    status: "todo" as const,
    categories: ["Regular"],
    date: today, // Today
    time: "10:00 am",
  },
  // Tomorrow's Goals (Nov 9)
  {
    id: 3,
    title: "Build API Endpoint",
    subtitle: "Backend Task",
    timeLeft: "2 Hours Left",
    status: "todo" as const,
    categories: ["Career building"],
    date: addDays(today, 1), // Tomorrow
    time: "09:00 am",
  },
  // Next Week (Nov 15)
  {
    id: 4,
    title: "User Testing Session",
    subtitle: "Product Design",
    timeLeft: "1 Hour",
    status: "todo" as const,
    categories: ["Regular"],
    date: addDays(today, 7), // Next week
    time: "02:00 pm",
  },
  // Past Completed Goal (Nov 7)
  {
    id: 5,
    title: "Deploy Hotfix",
    subtitle: "Backend Task",
    timeLeft: "Done",
    status: "completed" as const,
    categories: ["Career building"],
    date: subDays(today, 1), // Yesterday
    time: "04:30 pm",
  },
];

export const DashboardComponent = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [activeStreakTab, setActiveStreakTab] = useState("Streaks");

  // Master state for the selected date, defaults to today
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  // Memoized filtering logic
  const filteredGoals = useMemo(() => {
    // 1. Filter by the selected date
    const goalsForDay = ALL_GOALS.filter((goal) =>
      isSameDay(goal.date, selectedDate)
    );

    // 2. Filter by the active tab
    if (activeTab === "All") {
      return goalsForDay;
    }
    const tabStatus = activeTab.toLowerCase().replace(" ", "").replace("-", "");
    return goalsForDay.filter((goal) => {
      // Simple status mapping
      if (tabStatus === "todo") return goal.status === "todo";
      if (tabStatus === "inprogress") return goal.status === "inProgress";
      if (tabStatus === "completed") return goal.status === "completed";
      return false;
    });
  }, [selectedDate, activeTab]);

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16 sm:mb-0">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white p-5 rounded-sm">
            <TodayProgress goals={filteredGoals} selectedDate={selectedDate} />

            <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#636363] mb-4">
              Today's goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGoals.length > 0 ? (
                filteredGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    title={goal.title}
                    subtitle={goal.subtitle}
                    timeLeft={goal.timeLeft}
                    status={goal.status}
                    categories={goal.categories}
                    date={format(goal.date, "dd MMM yyyy")}
                    time={goal.time}
                  />
                ))
              ) : (
                <p className="text-gray-500">No goals found for this day.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      </div>

      {/* <div className="font-monts flex flex-col items-center p-6">
       
        <header className="w-full max-w-md flex items-center justify-center relative mb-8">
          <Link
            to={DASHBOARD}
            className="absolute left-0 p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Milestones</h1>
        </header>

      
        <SegmentedControl
          tabs={["Streaks", "Awards"]}
          activeTab={activeStreakTab}
          onTabChange={setActiveStreakTab}
        />

       
        <AnimatePresence mode="wait">
          {activeStreakTab === "Streaks" ? <StreaksView /> : <AwardsView />}
        </AnimatePresence>
      </div> */}
    </div>
  );
};
