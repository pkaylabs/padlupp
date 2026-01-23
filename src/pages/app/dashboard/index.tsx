import React, { useState, useMemo } from "react";
import { startOfToday, isSameDay, parseISO, format } from "date-fns";
import { CalendarWidget } from "./components/calendar-widget";
import { GoalCard } from "./components/goal-card";
import { GoalTabs } from "./components/goal-tabs";
import { TodayProgress } from "./components/progress";
import { ClipboardList } from "lucide-react";
import { useGoals } from "../goals/hooks/useGoals";
import { Goal } from "../goals/api";

export const DashboardComponent = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  // 1. Fetch Goals
  // We order by target_date to ensure the most relevant goals are likely in the first batch
  const {
    data: goalsData,
    isLoading,
    isError,
  } = useGoals({
    ordering: "-target_date",
  });

  // 2. Transform & Filter Goals
  const filteredGoals = useMemo(() => {
    if (!goalsData?.results) return [];

    // ROBUST FIX: Format selected date to YYYY-MM-DD string
    // This removes all timezone/offset issues. We compare the "calendar day" directly.
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

    return goalsData.results.filter((goal) => {
      // 1. Extract the date part from the API string (e.g., "2026-01-05")
      const goalDateStr = goal.start_date ? goal.start_date.split("T")[0] : "";

      // 2. Exact String Match
      if (goalDateStr !== selectedDateStr) return false;

      // 3. Tab Filtering
      if (activeTab === "All") return true;

      const normalizedStatus = goal.status.toLowerCase();
      const tabKey = activeTab.toLowerCase().replace(" ", "").replace("-", "");

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
    let uiStatus: "todo" | "inProgress" | "completed" = "todo";

    // Normalize status for UI
    if (goal.status === "completed") uiStatus = "completed";
    else if (goal.status === "in-progress" || goal.status === "inprogress")
      uiStatus = "inProgress";

    return {
      id: goal.id,
      title: goal.title,
      subtitle: goal.description || "No description",
      timeLeft: goal.status === "completed" ? "Done" : "Due today",
      status: uiStatus,
      categories: ["Regular"],
      // For display, we can use format/parseISO safely since it's just visual
      date: format(parseISO(goal.target_date), "dd MMM yyyy"),
      time: "09:00 am",
    };
  };

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16 sm:mb-0">
        {/* LEFT COLUMN: GOALS LIST */}
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
                  Failed to load goals. Please refresh the page.
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
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                    <ClipboardList className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-900 font-medium">No goals found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeTab !== "All"
                      ? `You have no ${activeTab.toLowerCase()} goals for this date.`
                      : "You haven't scheduled any goals for this day yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CALENDAR */}
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
