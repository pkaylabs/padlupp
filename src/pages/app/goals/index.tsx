import React, { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { startOfToday } from "date-fns";
import { BoardData, INITIAL_BOARD } from "@/constants/kanban-data";
import { TodayProgress } from "../dashboard/components/progress";
import { GoalColumn } from "./components/goal-column";
import { CalendarWidget } from "../dashboard/components/calendar-widget";
import { CreateGoalModal } from "./components/create-goal-modal";
import { GoalTabs } from "../dashboard/components/goal-tabs";
import { cn } from "@/utils/cs";

export const GoalsPage = () => {
  const [boardData, setBoardData] = useState<BoardData>(INITIAL_BOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  // 1. Add state for the filter tabs
  const [activeTab, setActiveTab] = useState("All");

  // 2. Logic to determine which columns to show
  const visibleColumns = useMemo(() => {
    if (activeTab === "All") {
      // Return all columns in specific order
      return [boardData.inProgress, boardData.todo, boardData.completed];
    }

    // Map tab names to column IDs
    const mapTabToId: Record<string, keyof BoardData> = {
      "To-do": "todo",
      "In progress": "inProgress",
      Completed: "completed",
    };

    const columnId = mapTabToId[activeTab];
    return columnId ? [boardData[columnId]] : [];
  }, [boardData, activeTab]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // Dropped outside or same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const startColumn = boardData[source.droppableId as keyof BoardData];
    const finishColumn = boardData[destination.droppableId as keyof BoardData];

    // Logic for moving items (same as before)
    const startItems = Array.from(startColumn.items);
    const [movedItem] = startItems.splice(source.index, 1);

    if (startColumn === finishColumn) {
      startItems.splice(destination.index, 0, movedItem);
      const newColumn = { ...startColumn, items: startItems };
      setBoardData((prev) => ({ ...prev, [newColumn.id]: newColumn }));
    } else {
      const finishItems = Array.from(finishColumn.items);
      finishItems.splice(destination.index, 0, movedItem);
      setBoardData((prev) => ({
        ...prev,
        [startColumn.id]: { ...startColumn, items: startItems },
        [finishColumn.id]: { ...finishColumn, items: finishItems },
      }));
    }
  };

  return (
    <div className="w-full">
      <div className="w-full mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8 mb-16 sm:mb-0 ">
        {/* LEFT SIDE: BOARD */}
        <div className="xl:col-span-3 flex flex-col h-full">
          <div className="bg-white pt-6 px-5 pb-5 rounded-lg mb-5">
            <div className="mb-6">
              <TodayProgress goals={[]} selectedDate={startOfToday()} />
            </div>

            {/* 3. Add the GoalTabs here */}
            <div className="">
              <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          <div className="mb-6">
            <h1 className="font-monts text-lg sm:text-xl font-semibold text-[#636363] ">
              Today's goals
            </h1>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div
              className={cn(
                "grid gap-6 w-full h-full transition-all",
                // 4. Dynamic grid: 3 cols if 'All', otherwise 1 col (taking partial width)
                activeTab === "All"
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-1 md:max-w-md"
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
        </div>

        {/* RIGHT SIDE: CALENDAR */}
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
