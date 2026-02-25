// src/components/goals/GoalColumn.tsx
import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/utils/cs";
import { Column, GoalStatus } from "@/constants/kanban-data";
import { KanbanCard } from "./kanban-card";

interface GoalColumnProps {
  column: Column;
  onAddTask: () => void;
}

export const GoalColumn: React.FC<GoalColumnProps> = ({
  column,
  onAddTask,
}) => {
  return (
    <div className="flex flex-col h-fit sm:w-[300px] bg-[#F5F5F5] dark:bg-slate-900 rounded-xl p-3 border border-transparent dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", column.color)} />
          <h3 className="font-medium text-xs text-[#0D062D] dark:text-slate-100">
            {column.title}
          </h3>
          <span className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            {column.items.length}
          </span>
        </div>
        <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Border Top Line */}
      <div className={cn("h-[3px] w-full rounded-full mb-4", column.color)} />

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 transition-colors rounded-xl",
              snapshot.isDraggingOver ? "bg-primary-100/50 dark:bg-slate-800/80" : ""
            )}
          >
            {column.items.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                columnId={column.id as GoalStatus}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className="mt-2 w-full py-3 bg-white dark:bg-slate-800 border border-[#959BA3] dark:border-slate-600 rounded-md flex items-center justify-center text-[#959BA3] dark:text-slate-300 gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow transition-all font-medium text-sm"
      >
        <Plus size={16} /> Add Task
      </button>
    </div>
  );
};
