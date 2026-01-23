import React, { useMemo, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { startOfToday, isSameDay, parseISO, format } from "date-fns";
import { Target, Plus, ClipboardList } from "lucide-react"; // Added Icons
import { TodayProgress } from "../dashboard/components/progress";
import { GoalColumn } from "./components/goal-column";
import { CalendarWidget } from "../dashboard/components/calendar-widget";
import { CreateGoalModal } from "./components/create-goal-modal";
import { GoalTabs } from "../dashboard/components/goal-tabs";
import { cn } from "@/utils/cs";
import { BoardData } from "@/constants/kanban-data";
import Button from "@/components/core/buttons";
import { useGoals } from "./hooks/useGoals";
import { useUpdateGoal } from "./hooks/useUpdateGoal";
import moment from "moment";

// Initial Empty Board Structure
const EMPTY_BOARD: BoardData = {
  todo: { id: "todo", title: "To-do", color: "bg-primary-500", items: [] },
  inProgress: {
    id: "inProgress",
    title: "In progress",
    color: "bg-[#EB612C]",
    items: [],
  },
  completed: {
    id: "completed",
    title: "Completed",
    color: "bg-[#1DB9C3]",
    items: [],
  },
};

export const GoalsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  // 1. Fetch Goals
  const { data: goalsData, isLoading } = useGoals({ ordering: "target_date" });

  console.log(goalsData, "goals data");

  // 2. Mutation for Drag & Drop
  const { mutate: updateGoalStatus } = useUpdateGoal();

  const boardData = useMemo(() => {
    if (!goalsData?.results) return EMPTY_BOARD;

    const board: BoardData = JSON.parse(JSON.stringify(EMPTY_BOARD));

    // 1. Format the selected date to a string "YYYY-MM-DD"
    // This removes time/timezone variables from the equation
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

    goalsData.results.forEach((goal) => {
      // 2. Extract the date part from the API string safely
      // Handles both "2026-01-05" and "2026-01-05T14:30:00Z"
      const goalDateStr = goal.start_date ? goal.start_date.split("T")[0] : "";

      // 3. Compare Strings directly
      if (goalDateStr !== selectedDateStr) return;

      const item = {
        id: goal.id.toString(),
        title: goal.title,
        description: goal.description,
        tags: ["Regular"],
        // For display, we can still parse it to look nice
        date: format(parseISO(goal.target_date), "dd MMM YYY"),
        timeLeft: moment(goal.target_date).endOf("day").fromNow(),
      };

      if (goal.status === "completed") {
        board.completed.items.push(item);
      } else if (
        goal.status === "in-progress" ||
        goal.status === "inprogress"
      ) {
        board.inProgress.items.push(item);
      } else {
        board.todo.items.push(item);
      }
    });

    return board;
  }, [goalsData, selectedDate]);

  // 4. Handle Drag End
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    let newStatus = "planned";
    if (destination.droppableId === "completed") newStatus = "completed";
    if (destination.droppableId === "inProgress") newStatus = "in-progress";

    updateGoalStatus({
      id: draggableId,
      data: { status: newStatus },
    });
  };

  // 5. Logic for Tabs (Filtering Columns)
  const visibleColumns = useMemo(() => {
    if (activeTab === "All") {
      return [boardData.inProgress, boardData.todo, boardData.completed];
    }
    const mapTabToId: Record<string, keyof BoardData> = {
      "To-do": "todo",
      "In progress": "inProgress",
      Completed: "completed",
    };
    const columnId = mapTabToId[activeTab];
    return columnId ? [boardData[columnId]] : [];
  }, [boardData, activeTab]);

  // 6. Check if there are any goals in the currently visible columns
  const hasGoals = useMemo(() => {
    return visibleColumns.some((col) => col.items.length > 0);
  }, [visibleColumns]);

  return (
    <div className="w-full">
      <div className="w-full mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8 mb-16 sm:mb-0 ">
        <div className="xl:col-span-3 flex flex-col h-full">
          <div className="bg-white pt-6 px-5 pb-5 rounded-lg mb-5">
            <div className="mb-6">
              <TodayProgress
                goals={Object.values(boardData)
                  .flatMap((c) => c.items)
                  .map((i) => ({ ...i, status: "todo" }))}
                selectedDate={selectedDate}
              />
            </div>
            <div className="">
              <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h1 className="font-monts text-lg sm:text-xl font-semibold text-[#636363] ">
              {isSameDay(selectedDate, startOfToday())
                ? "Today's goals"
                : `Goals for ${format(selectedDate, "MMM do")}`}
            </h1>

            {/* Show 'Create' button here too if list is empty to be helpful */}
            {!isLoading && !hasGoals && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Quick Add
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-64 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : !hasGoals ? (
            // --- EMPTY STATE UI ---
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                {activeTab === "Completed" ? (
                  <ClipboardList size={32} className="text-gray-400" />
                ) : (
                  <Target size={32} className="text-blue-500" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === "Completed"
                  ? "No completed goals yet"
                  : "No goals found"}
              </h3>
              <p className="text-gray-500 mb-6 text-sm max-w-xs text-center mt-1">
                {activeTab === "Completed"
                  ? "Keep working! Once you finish a task, it will appear here."
                  : isSameDay(selectedDate, startOfToday())
                    ? "You haven't set any goals for today. Ready to start?"
                    : `No goals scheduled for ${format(selectedDate, "MMMM do")}.`}
              </p>

              {/* Only show Create button if we aren't in 'Completed' tab (logic choice) */}
              {activeTab !== "Completed" && (
                <Button
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 w-fit"
                >
                  <Plus size={18} /> Create New Goal
                </Button>
              )}
            </div>
          ) : (
            // --- KANBAN BOARD ---
            <DragDropContext onDragEnd={onDragEnd}>
              <div
                className={cn(
                  "grid gap-6 w-full h-full transition-all",
                  activeTab === "All"
                    ? "grid-cols-1 md:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-1 md:max-w-md",
                )}
              >
                {visibleColumns.map((column) => (
                  <GoalColumn
                    key={column.id}
                    column={column}
                    onAddTask={() => setIsModalOpen(true)}
                  />
                ))}
              </div>
            </DragDropContext>
          )}
        </div>

        <div className="xl:col-span-1">
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      </div>

      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
