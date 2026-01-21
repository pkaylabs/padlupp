// // src/pages/DashboardPage.tsx
// import React, { useState, useMemo } from "react";
// import { createFileRoute, Link } from "@tanstack/react-router";
// import { isSameDay, addDays, subDays, startOfToday, format } from "date-fns";
// import { CalendarWidget } from "./components/calendar-widget";
// import { GoalCard } from "./components/goal-card";
// import { GoalTabs } from "./components/goal-tabs";
// import { TodayProgress } from "./components/progress";
// import { DASHBOARD } from "@/constants/page-path";
// import { ChevronLeft } from "lucide-react";
// import { AnimatePresence } from "framer-motion";
// import { StreaksView } from "./components/streaks-view";
// import { AwardsView } from "./components/awards-view";
// import { SegmentedControl } from "@/components/system/segment-control";

// const today = startOfToday();
// const ALL_GOALS = [
//   // Today's Goals (Nov 8, 2025)
//   {
//     id: 1,
//     title: "Basic Syntax & Variables",
//     subtitle: "Learning Python",
//     timeLeft: "12 Min Left",
//     status: "inProgress" as const,
//     categories: ["Regular", "Career building"],
//     date: today, // Today
//     time: "01:40 pm",
//   },
//   {
//     id: 45,
//     title: "Basic Syntax & Variables",
//     subtitle: "Learning Python",
//     timeLeft: "12 Min Left",
//     status: "inProgress" as const,
//     categories: ["Regular", "Career building"],
//     date: today, // Today
//     time: "01:40 pm",
//   },
//   {
//     id: 33,
//     title: "Basic Syntax & Variables",
//     subtitle: "Learning Python",
//     timeLeft: "12 Min Left",
//     status: "inProgress" as const,
//     categories: ["Regular", "Career building"],
//     date: today, // Today
//     time: "01:40 pm",
//   },
//   {
//     id: 2,
//     title: "Review PRD",
//     subtitle: "Product Design",
//     timeLeft: "30 Min Left",
//     status: "todo" as const,
//     categories: ["Regular"],
//     date: today, // Today
//     time: "10:00 am",
//   },
//   {
//     id: 23,
//     title: "Review PRD",
//     subtitle: "Product Design",
//     timeLeft: "30 Min Left",
//     status: "todo" as const,
//     categories: ["Regular"],
//     date: today, // Today
//     time: "10:00 am",
//   },
//   {
//     id: 22,
//     title: "Review PRD",
//     subtitle: "Product Design",
//     timeLeft: "30 Min Left",
//     status: "todo" as const,
//     categories: ["Regular"],
//     date: today, // Today
//     time: "10:00 am",
//   },
//   // Tomorrow's Goals (Nov 9)
//   {
//     id: 3,
//     title: "Build API Endpoint",
//     subtitle: "Backend Task",
//     timeLeft: "2 Hours Left",
//     status: "todo" as const,
//     categories: ["Career building"],
//     date: addDays(today, 1), // Tomorrow
//     time: "09:00 am",
//   },
//   // Next Week (Nov 15)
//   {
//     id: 4,
//     title: "User Testing Session",
//     subtitle: "Product Design",
//     timeLeft: "1 Hour",
//     status: "todo" as const,
//     categories: ["Regular"],
//     date: addDays(today, 7), // Next week
//     time: "02:00 pm",
//   },
//   // Past Completed Goal (Nov 7)
//   {
//     id: 5,
//     title: "Deploy Hotfix",
//     subtitle: "Backend Task",
//     timeLeft: "Done",
//     status: "completed" as const,
//     categories: ["Career building"],
//     date: subDays(today, 1), // Yesterday
//     time: "04:30 pm",
//   },
// ];

// export const DashboardComponent = () => {
//   const [activeTab, setActiveTab] = useState("All");
//   const [activeStreakTab, setActiveStreakTab] = useState("Streaks");

//   // Master state for the selected date, defaults to today
//   const [selectedDate, setSelectedDate] = useState(startOfToday());

//   // Memoized filtering logic
//   const filteredGoals = useMemo(() => {
//     // 1. Filter by the selected date
//     const goalsForDay = ALL_GOALS.filter((goal) =>
//       isSameDay(goal.date, selectedDate)
//     );

//     // 2. Filter by the active tab
//     if (activeTab === "All") {
//       return goalsForDay;
//     }
//     const tabStatus = activeTab.toLowerCase().replace(" ", "").replace("-", "");
//     return goalsForDay.filter((goal) => {
//       // Simple status mapping
//       if (tabStatus === "todo") return goal.status === "todo";
//       if (tabStatus === "inprogress") return goal.status === "inProgress";
//       if (tabStatus === "completed") return goal.status === "completed";
//       return false;
//     });
//   }, [selectedDate, activeTab]);

//   return (
//     <div className="">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16 sm:mb-0">
//         <div className="lg:col-span-2 space-y-5">
//           <div className="bg-white p-5 rounded-sm">
//             <TodayProgress goals={filteredGoals} selectedDate={selectedDate} />

//             <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />
//           </div>

//           <div>
//             <h2 className="text-xl sm:text-2xl font-semibold text-[#636363] mb-4">
//               Today's goals
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {filteredGoals.length > 0 ? (
//                 filteredGoals.map((goal) => (
//                   <GoalCard
//                     key={goal.id}
//                     title={goal.title}
//                     subtitle={goal.subtitle}
//                     timeLeft={goal.timeLeft}
//                     status={goal.status}
//                     categories={goal.categories}
//                     date={format(goal.date, "dd MMM yyyy")}
//                     time={goal.time}
//                   />
//                 ))
//               ) : (
//                 <p className="text-gray-500">No goals found for this day.</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="lg:col-span-1">
//           <CalendarWidget
//             selectedDate={selectedDate}
//             onDateSelect={setSelectedDate}
//           />
//         </div>
//       </div>

//       {/* <div className="font-monts flex flex-col items-center p-6">

//         <header className="w-full max-w-md flex items-center justify-center relative mb-8">
//           <Link
//             to={DASHBOARD}
//             className="absolute left-0 p-2 rounded-full hover:bg-gray-100"
//           >
//             <ChevronLeft size={24} className="text-gray-700" />
//           </Link>
//           <h1 className="text-lg font-semibold text-gray-900">Milestones</h1>
//         </header>

//         <SegmentedControl
//           tabs={["Streaks", "Awards"]}
//           activeTab={activeStreakTab}
//           onTabChange={setActiveStreakTab}
//         />

//         <AnimatePresence mode="wait">
//           {activeStreakTab === "Streaks" ? <StreaksView /> : <AwardsView />}
//         </AnimatePresence>
//       </div> */}
//     </div>
//   );
// };

// src/pages/DashboardPage.tsx
import React, { useState, useMemo } from "react";
import { startOfToday, isSameDay, parseISO, format } from "date-fns";
import { CalendarWidget } from "./components/calendar-widget";
import { GoalCard } from "./components/goal-card";
import { GoalTabs } from "./components/goal-tabs";
import { TodayProgress } from "./components/progress";
import { useGoals } from "../goals/hooks/useGoals";
import { Goal } from "../goals/api";

export const DashboardComponent = () => {
  const [activeTab, setActiveTab] = useState("All");

  const [selectedDate, setSelectedDate] = useState(startOfToday());

  const {
    data: goalsData,
    isLoading,
    isError,
  } = useGoals({
    ordering: "-target_date", // Order by target date to get relevant ones
    page: 1,
  });

  // 2. Transform & Filter Goals
  const filteredGoals = useMemo(() => {
    if (!goalsData?.results) return [];

    // Step A: Filter by Date & Tab
    return goalsData.results.filter((goal) => {
      const goalDate = parseISO(goal.target_date); // Convert API string to Date

      // Date Check
      const isDayMatch = isSameDay(goalDate, selectedDate);
      if (!isDayMatch) return false;

      // Tab Check
      if (activeTab === "All") return true;

      const normalizedStatus = goal.status.toLowerCase();
      const tabKey = activeTab.toLowerCase().replace(" ", "").replace("-", "");

      // Map backend status to tab keys
      // Backend: "planned", "in-progress", "completed" (assumption based on prev prompts)
      // Tabs: "todo", "inprogress", "completed"
      if (tabKey === "todo")
        return normalizedStatus === "planned" || normalizedStatus === "todo";
      if (tabKey === "inprogress")
        return (
          normalizedStatus === "in-progress" ||
          normalizedStatus === "inprogress"
        );
      if (tabKey === "completed") return normalizedStatus === "completed";

      return false;
    });
  }, [goalsData, selectedDate, activeTab]);

  // Helper to map API Goal to UI GoalCard props
  const mapGoalToCard = (goal: Goal) => {
    // Map backend status to UI component status types
    let uiStatus: "todo" | "inProgress" | "completed" = "todo";
    if (goal.status === "completed") uiStatus = "completed";
    else if (goal.status === "in-progress" || goal.status === "inprogress")
      uiStatus = "inProgress";

    return {
      id: goal.id,
      title: goal.title,
      subtitle: goal.description || "No description", // Fallback
      timeLeft: goal.status === "completed" ? "Done" : "Due today", // calc logic can be added here
      status: uiStatus,
      // API doesn't return categories array yet based on previous prompt, using default
      categories: ["Regular"],
      date: format(parseISO(goal.target_date), "dd MMM yyyy"),
      time: "09:00 am", // specific time not in API yet
    };
  };

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16 sm:mb-0">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white p-5 rounded-sm">
            {/* Pass mapped goals to Progress widget */}
            <TodayProgress
              goals={filteredGoals.map(mapGoalToCard)}
              selectedDate={selectedDate}
            />

            <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#636363] mb-4">
              {isSameDay(selectedDate, startOfToday())
                ? "Today's goals"
                : `Goals for ${format(selectedDate, "MMM do")}`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loading State */}
              {isLoading && (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-40 bg-gray-100 animate-pulse rounded-xl"
                    />
                  ))}
                </>
              )}

              {/* Error State */}
              {isError && (
                <div className="col-span-full p-6 text-center text-red-500 bg-red-50 rounded-xl">
                  Failed to load goals. Please refresh.
                </div>
              )}

              {/* Data State */}
              {!isLoading &&
                !isError &&
                filteredGoals.length > 0 &&
                filteredGoals.map((goal) => {
                  const cardProps = mapGoalToCard(goal);
                  return <GoalCard key={goal.id} {...cardProps} />;
                })}

              {/* Empty State */}
              {!isLoading && !isError && filteredGoals.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 font-medium">
                    No goals found for this specific day.
                  </p>
                  {activeTab !== "All" && (
                    <p className="text-sm text-gray-400 mt-1">
                      Try switching tabs or selecting a different date.
                    </p>
                  )}
                </div>
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
    </div>
  );
};
