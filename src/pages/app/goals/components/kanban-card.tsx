// src/components/goals/KanbanCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { AlarmClock, Clock, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cs";
import { GoalStatus, Task } from "@/constants/kanban-data";
import { Calendar } from "iconsax-reactjs";
import { useNavigate } from "@tanstack/react-router";
import { GoalActionsMenu } from "./goal-actions-menu";
import type { Goal } from "../api";

interface KanbanCardProps {
  task: Task;
  index: number;
  columnId: GoalStatus;
  goal: Goal | null;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
  onShareGoal: (goal: Goal) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  index,
  columnId,
  goal,
  onEditGoal,
  onDeleteGoal,
  onShareGoal,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeText = task.time?.trim() || "No time set";
  const sharedPartnerName =
    goal?.partner?.name || goal?.partner_name || task.sharedPartnerName || "";
  const sharedPartnerAvatar =
    goal?.partner?.avatar ||
    goal?.partner_avatar ||
    task.sharedPartnerAvatar ||
    "";
  const isSharedGoal = Boolean(goal?.partnership || task.partnershipId);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isMenuOpen]);

  const getTagClassName = (tag: string) => {
    const normalized = tag.toLowerCase();
    if (normalized.includes("career")) return "bg-pink-100 text-[#F56FAD]";
    if (normalized.includes("high") || normalized.includes("urgent")) {
      return "bg-red-50 text-[#C51616]";
    }
    if (
      normalized.includes("in progress") ||
      normalized.includes("in-progress")
    ) {
      return "bg-orange-50 text-[#EB612C]";
    }
    if (normalized.includes("completed")) return "bg-cyan-50 text-[#1DB9C3]";
    if (normalized.includes("to-do") || normalized.includes("todo")) {
      return "bg-blue-50 text-[#4E92F4]";
    }
    return "bg-green-50 text-[#60BF9D]";
  };

  const dateTimeFooter = (
    <div className="pt-2 border-t border-gray-50 dark:border-slate-700 text-[#44424C] text-nowrap dark:text-slate-300">
      <div className="bg-[#F5F6F8] dark:bg-slate-700 flex items-center justify-between gap-1.5 py-2.5 px-2 rounded-[10.25px]">
        <div className="flex items-center gap-0.5 text-[11px]">
          <div className="size-6 flex justify-center items-center bg-white dark:bg-slate-800 border border-[#D6D6D6] dark:border-slate-600 shadow rounded-full">
            <Calendar color="#3D89FB" size={14} />
          </div>

          <span>{task.date}</span>
        </div>
        <div className="flex items-center gap-0.5 text-[11px]">
          <div className="size-6 flex justify-center items-center bg-white dark:bg-slate-800 border border-[#D6D6D6] dark:border-slate-600 shadow rounded-full">
            <AlarmClock size={14} className="text-[#F29268]" />
          </div>
          <span>{timeText}</span>
        </div>
      </div>
    </div>
  );

  const sharedBadge = isSharedGoal ? (
    <div
      className="ml-2 shrink-0 flex items-center"
      title={sharedPartnerName || "Shared goal"}
    >
      {sharedPartnerAvatar ? (
        <img
          src={sharedPartnerAvatar}
          alt={sharedPartnerName || "Shared partner"}
          className="w-6 h-6 rounded-full border border-white dark:border-slate-700 object-cover"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-white dark:border-slate-700 flex items-center justify-center text-[10px] font-semibold">
          {(sharedPartnerName || "SP")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("")}
        </div>
      )}
    </div>
  ) : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-white dark:bg-slate-800 rounded-[10.25px] p-4 mb-4 shadow-lg dark:shadow-slate-950/40 transition-shadow group border border-transparent dark:border-slate-700",
            snapshot.isDragging
              ? "shadow-xl rotate-2 ring-2 ring-blue-500/20"
              : "hover:shadow-md",
          )}
          style={provided.draggableProps.style}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
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
            <div className="flex items-center gap-1" ref={menuRef}>
              {sharedBadge}
              {goal && (
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Goal actions"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsMenuOpen((prev) => !prev);
                    }}
                    className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  <GoalActionsMenu
                    isOpen={isMenuOpen}
                    onEdit={() => {
                      setIsMenuOpen(false);
                      onEditGoal(goal);
                    }}
                    onShare={() => {
                      setIsMenuOpen(false);
                      onShareGoal(goal);
                    }}
                    onDelete={() => {
                      setIsMenuOpen(false);
                      onDeleteGoal(goal);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isMenuOpen) return;
              void navigate({
                to: "/goals/$id",
                params: { id: task.id },
              });
            }}
            className="w-full text-left"
          >
            <h4 className="font-semibold text-[#0D062D] dark:text-slate-100 mb-1">
              {task.title}
            </h4>
            <p className="text-xs text-[#787486] dark:text-slate-400 mb-3 line-clamp-2">
              {task.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-medium",
                    getTagClassName(tag),
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {columnId === "inProgress" && typeof task.progress === "number" ? (
              <>
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
                {dateTimeFooter}
              </>
            ) : columnId === "completed" ? (
              <>
                <div className="pt-2 border-t border-gray-50 dark:border-slate-700">
                  <div className="bg-[#F5F6F8] dark:bg-slate-700 flex items-center gap-1.5 py-3.5 px-2 rounded-[10.25px]">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Done
                    </span>
                  </div>
                </div>
                {dateTimeFooter}
              </>
            ) : (
              dateTimeFooter
            )}
          </button>
        </div>
      )}
    </Draggable>
  );
};
