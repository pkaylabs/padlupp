// src/components/goals/KanbanCard.tsx
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cs";
import { GoalStatus, Task } from "@/constants/kanban-data";
import { Calendar } from "iconsax-reactjs";
import { Link } from "@tanstack/react-router";

interface KanbanCardProps {
  task: Task;
  index: number;
  columnId: GoalStatus;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  index,
  columnId,
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Link
          to={"/goals/$id"}
          params={{
            id: task.id,
          }}
        >
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              "bg-white dark:bg-slate-800 rounded-[10.25px] p-4 mb-4 shadow-lg dark:shadow-slate-950/40 transition-shadow group border border-transparent dark:border-slate-700",
              snapshot.isDragging
                ? "shadow-xl rotate-2 ring-2 ring-blue-500/20"
                : "hover:shadow-md"
            )}
            style={provided.draggableProps.style}
          >
            {/* Header Badges */}
            <div className="mb-2">
              {columnId === "inProgress" && (
                <span className="bg-[#EB612C] text-white text-[10px] font-medium px-2 py-1 rounded-[2.56px] flex items-center w-fit gap-1">
                  <Clock size={12} /> Ongoing
                </span>
              )}
              {columnId === "todo" && task.timeLeft && (
                <span className="bg-primary-500 text-white text-[10px] font-medium px-2 py-1 rounded-[2.56px] flex items-center w-fit gap-1">
                  <Clock size={12} /> {task.timeLeft}
                </span>
              )}
              {columnId === "completed" && (
                <span className="bg-[#1DB9C3] text-white text-[10px] font-medium px-2 py-1 rounded-[2.56px] flex items-center w-fit gap-1">
                  Completed
                </span>
              )}
            </div>

            {/* Content */}
            <h4 className="font-semibold text-[#0D062D] dark:text-slate-100 mb-1">{task.title}</h4>
            <p className="text-xs text-[#787486] dark:text-slate-400 mb-3 line-clamp-2">
              {task.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-medium",
                    tag.includes("Career")
                      ? "bg-pink-100 text-[#F56FAD] "
                      : tag.includes("High")
                        ? "bg-red-50 text-[#C51616] "
                        : "bg-green-50 text-[#60BF9D] "
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer: Progress Bar OR Date/Time */}
            {columnId === "inProgress" && typeof task.progress === "number" ? (
              <div className="pt-2 border-t border-gray-50 dark:border-slate-700">
                <div className=" bg-[#F5F6F8] dark:bg-slate-700 flex items-center justify-between gap-1.5 py-3.5 px-2 rounded-[10.25px] ">
                  <div className="h-1.5 w-full bg-[#EEEEEE] dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-100">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ) : columnId === "completed" ? (
              <div className="pt-2 border-t border-gray-50 dark:border-slate-700">
                <div className="bg-[#F5F6F8] dark:bg-slate-700 flex items-center gap-1.5 py-3.5 px-2 rounded-[10.25px]">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Done
                  </span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-50 dark:border-slate-700 text-[#44424C] dark:text-slate-300">
                <div className="bg-[#F5F6F8] dark:bg-slate-700 flex items-center justify-between gap-1.5 py-2.5 px-2 rounded-[10.25px]">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="size-6 flex justify-center items-center bg-white dark:bg-slate-800 border border-[#D6D6D6] dark:border-slate-600 shadow rounded-full">
                      <Calendar color="#3D89FB" size={14} />
                    </div>

                    <span>{task.date}</span>
                  </div>
                  {task.time && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={14} />
                      <span>{task.time}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      )}
    </Draggable>
  );
};
