import React, { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  MoreVertical,
  Calendar,
  Plus,
  Clock,
  Circle,
  ArrowLeft,
  CheckCircle2,
  ListTodo,
  Activity,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cs";
import { format, parseISO, startOfToday } from "date-fns";
import { CalendarWidget } from "../dashboard/components/calendar-widget";
import Button from "@/components/core/buttons";
import { useGoal } from "./hooks/useGoal";
import { useCreateTask, useTasks } from "./hooks/useTasks";
import { useUpdateGoal } from "./hooks/useUpdateGoal";

export function GoalDetailsPage() {
  const { id } = useParams({ from: "/_app/goals/$id" });

  // UI State
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  // Data Fetching
  const { data: goal, isLoading: loadingGoal, isError } = useGoal(id);
  const { data: tasksData, isLoading: loadingTasks } = useTasks({
    ordering: "created_at",
  });

  // Mutations
  const { mutate: updateGoal } = useUpdateGoal();
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();

  // Filter tasks for this goal
  const goalSubtasks =
    tasksData?.results.filter((t) => t.goal === Number(id)) || [];

  // --- Handlers ---

  const handleStatusChange = (newStatus: string) => {
    let apiStatus = "planned";
    if (newStatus === "In progress") apiStatus = "in-progress";
    if (newStatus === "Completed") apiStatus = "completed";
    updateGoal({ id: goal!.id, data: { status: apiStatus } });
    setStatusPopoverOpen(false);
  };

  const handleAddSubtask = () => {
    // In a real app, this would be a modal or inline input
    const title = prompt("Enter subtask title:");
    if (title && goal) {
      createTask({
        goal: goal.id,
        title: title,
        status: "planned",
        due_at: new Date().toISOString(), // Default to today
      });
    }
  };

  // --- LOADING STATE (SKELETON) ---
  if (loadingGoal) {
    return (
      <div className="font-monts flex h-screen bg-white dark:bg-slate-950">
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-8 w-64 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-24 w-full bg-gray-50 dark:bg-slate-900 rounded-xl animate-pulse" />
        </div>
        <div className="hidden lg:block w-96 border-l border-gray-200 dark:border-slate-800" />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (isError || !goal) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Goal not found</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          This goal may have been deleted or does not exist.
        </p>
        <Link to="/goals">
          <Button variant="primary">Back to Goals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="font-monts flex h-screen overflow-hidden bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link
              to="/goals"
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-100 truncate max-w-md">
              {goal.title}
            </h1>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400">
            <MoreVertical size={20} />
          </button>
        </header>

        <div className="px-4 py-8 sm:p-8 max-w-4xl mx-auto w-full pb-20">
          {/* Progress Section (Mocked for now) */}
          <div className="mb-10 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  Progress
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {goal.status === "completed" ? "100%" : "In Progress"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                  Target Date
                </span>
                <div className="flex items-center gap-1.5 text-gray-800 dark:text-slate-200 mt-1">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="font-semibold">
                    {format(parseISO(goal.target_date), "MMM do, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-2.5 w-full bg-white/50 dark:bg-slate-700/70 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  goal.status === "completed"
                    ? "bg-green-500 w-full"
                    : "bg-blue-500 w-[25%]"
                )}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              Description
            </h3>
            <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
              <p
                className={cn(
                  "text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap",
                  !isDescExpanded && "line-clamp-3"
                )}
              >
                {goal.description || "No description provided for this goal."}
              </p>
              {goal.description && goal.description.length > 150 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-blue-600 text-xs font-semibold mt-3 hover:underline flex items-center gap-1"
                >
                  {isDescExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                Subtasks{" "}
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">
                  {goalSubtasks.length}
                </span>
              </h3>
              <button
                onClick={handleAddSubtask}
                disabled={isCreatingTask}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus size={16} />
                {isCreatingTask ? "Adding..." : "Add Subtask"}
              </button>
            </div>

            <div className="space-y-3">
              {loadingTasks ? (
                // Subtask Skeleton
                [1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-50 dark:bg-slate-800 rounded-xl animate-pulse"
                  />
                ))
              ) : goalSubtasks.length === 0 ? (
                // --- EMPTY STATE FOR SUBTASKS ---
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-3">
                    <ListTodo className="text-gray-400 dark:text-slate-500" size={24} />
                  </div>
                  <p className="text-gray-900 dark:text-slate-100 font-medium text-sm">
                    No subtasks yet
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs mt-1 max-w-xs">
                    Break this goal down into smaller, manageable steps to track
                    your progress better.
                  </p>
                  <button
                    onClick={handleAddSubtask}
                    className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Create first task
                  </button>
                </div>
              ) : (
                goalSubtasks.map((task) => (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={task.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex items-start gap-3"
                  >
                    <button className="mt-0.5 text-gray-300 dark:text-slate-500 hover:text-blue-500 transition-colors">
                      {task.status === "completed" ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm text-gray-800 dark:text-slate-200 font-medium",
                          task.status === "completed" &&
                            "text-gray-400 dark:text-slate-500 line-through"
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                        {task.due_at && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />{" "}
                            {format(parseISO(task.due_at), "MMM d, p")}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-4 mb-12">
            <div className="relative">
              <button
                onClick={() => setStatusPopoverOpen(!statusPopoverOpen)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors",
                  goal.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : goal.status === "in-progress"
                      ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300"
                )}
              >
                {goal.status === "completed" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}
                <span className="capitalize">
                  {goal.status.replace("-", " ")}
                </span>
              </button>

              <AnimatePresence>
                {statusPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1.5 z-30"
                  >
                    {["To-do", "In progress", "Completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            status === "To-do"
                              ? "bg-gray-400"
                              : status === "In progress"
                                ? "bg-orange-500"
                                : "bg-green-500"
                          )}
                        />
                        {status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Activity Log (Placeholder with Empty State) */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              Activity History
            </h4>

            {/* --- EMPTY STATE FOR ACTIVITIES --- */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-6 text-center border border-transparent dark:border-slate-800">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center mb-2 shadow-sm">
                <Activity size={18} className="text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                No recent activity recorded for this goal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Sidebar */}
      <div className="hidden lg:block w-96 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-4">
        <CalendarWidget
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
    </div>
  );
}
