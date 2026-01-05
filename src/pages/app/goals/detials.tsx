// src/pages/GoalDetailsPage.tsx
import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  MoreVertical,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Share2,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cs";
import { format, startOfToday } from "date-fns";
import { ArrowLeft } from "iconsax-reactjs";
import { CalendarView } from "@/components/system/date-picker/calendar-view";
import { CalendarWidget } from "../dashboard/components/calendar-widget";
import { useGoal } from "./hooks/useGoal";

// --- Types ---
interface Subtask {
  id: string;
  text: string;
  date: string;
  time: string;
  completed: boolean;
}

// --- Mock Data ---
const MOCK_GOAL = {
  id: "1",
  title: "Learning python",
  description:
    "Lorem ipsum dolor sit amet consectetur. Purus convallis volutpat mollis vitae dolor posuere magna rutrum. Sed gravida interdum commodo purus tincidunt. Ultricies arcu sit scelerisque non massa. Sed ut mauris sagittis massa imperdiet volutpat. Nunc egestas tellus enim dignissim.",
  startDate: new Date(2025, 2, 30), // March 30, 2025
  endDate: new Date(2025, 4, 30), // May 30, 2025
  status: "In progress",
  categories: ["Regular", "Career building"],
  sharedWith: [
    { id: "u1", name: "Musa Ayobami", avatar: "M", color: "bg-orange-200" },
    { id: "u2", name: "Olivia Rodrigo", avatar: "O", color: "bg-blue-200" },
  ],
  subtasks: [
    {
      id: "s1",
      text: "Lorem ipsum dolor sit amet consectetur.",
      date: "5 Apr",
      time: "01:40 PM",
      completed: true,
    },
    {
      id: "s2",
      text: "Lorem ipsum dolor sit amet consectetur.",
      date: "5 Apr",
      time: "01:40 PM",
      completed: false,
    },
    {
      id: "s3",
      text: "Lorem ipsum dolor sit amet consectetur.",
      date: "5 Apr",
      time: "01:40 PM",
      completed: false,
    },
    {
      id: "s4",
      text: "Lorem ipsum dolor sit amet consectetur.",
      date: "5 Apr",
      time: "01:40 PM",
      completed: false,
    },
  ] as Subtask[],
  activities: [
    {
      id: "a1",
      user: "Jade",
      action: "changed the status of",
      target: "Finish topic 2",
      from: "To do",
      to: "in progress",
      date: "2nd Dec",
      time: "11:00am",
    },
    {
      id: "a2",
      user: "Jade",
      action: "shared file",
      target: "Topic 2",
      date: "2nd Dec",
      time: "11:00am",
    },
  ],
};

export const GoalDetailsPage = () => {
  const [goal, setGoal] = useState(MOCK_GOAL);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(startOfToday());

  // const { data: goal, isPending, isError } = useGoal(goalId);

  // if (isPending) {
  //   return <div className="p-8 text-center text-gray-500">Loading goal details...</div>;
  // }

  // if (isError || !goal) {
  //   return <div className="p-8 text-center text-red-500">Goal not found.</div>;
  // }

  const toggleSubtask = (id: string) => {
    setGoal((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const handleStatusChange = (newStatus: string) => {
    setGoal((prev) => ({ ...prev, status: newStatus }));
    setStatusPopoverOpen(false);
  };

  return (
    <div className="font-monts flex">
      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 pr-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link
              to="/goals"
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
            >
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-[#636363] ">
              {goal.title}
            </h1>
          </div>

          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setSharePopoverOpen(!sharePopoverOpen)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <MoreVertical size={20} />
            </button>

            <AnimatePresence>
              {sharePopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-8 right-5 mb-2 w-30 bg-white rounded-xl shadow-lg border border-gray-100 z-20"
                >
                  <button className="w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 ">
                    Share
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="px-2 py-8 sm:p-8 max-w-4xl mx-auto w-full pb-20">
          {/* Progress Bar (Top) */}
          <div className="mb-8">
            {/* Reuse your TodayProgress logic here if needed, simplified for now */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Today</span>
              <span className="text-gray-400">45% complete</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full">
              <div className="h-full bg-blue-500 w-[45%] rounded-full" />
            </div>
            {/* Tabs placeholder */}
            <div className="flex gap-8 mt-6 border-b border-gray-200 text-sm font-medium text-gray-500">
              <button className="pb-3 border-b-2 border-blue-500 text-blue-600">
                All
              </button>
              <button className="pb-3 hover:text-gray-800">To-do</button>
              <button className="pb-3 hover:text-gray-800">In progress</button>
              <button className="pb-3 hover:text-gray-800">Completed</button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Description
            </h3>
            <p
              className={cn(
                "text-gray-700 text-sm leading-relaxed",
                !isDescExpanded && "line-clamp-3"
              )}
            >
              {goal.description}
            </p>
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-blue-500 text-sm font-medium mt-1 hover:underline"
            >
              {isDescExpanded ? "view less" : "view more"}
            </button>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-3 text-gray-600 text-sm mb-8">
            <Calendar size={18} />
            <span>
              {format(goal.startDate, "do MMMM, yyyy")} -{" "}
              {format(goal.endDate, "do MMMM, yyyy")}
            </span>
          </div>

          {/* Add Subtask Button */}
          <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-medium mb-6">
            <Plus size={18} /> Add subtask
          </button>

          {/* Subtasks List */}
          <div className="space-y-3 mb-8">
            {goal.subtasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleSubtask(task.id)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-start justify-between group"
              >
                <div>
                  <p
                    className={cn(
                      "text-sm text-gray-800 mb-1",
                      task.completed && "text-gray-400 line-through"
                    )}
                  >
                    {task.text}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-blue-400">
                    <span>{task.date}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} /> {task.time}
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  {task.completed ? (
                    <div className="w-5 h-5 rounded-full border-4 border-orange-100 bg-white flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    </div>
                  ) : (
                    <Circle
                      size={20}
                      className="text-gray-300 group-hover:text-gray-400"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Status & Categories */}
          <div className="flex flex-wrap gap-3 mb-10 relative">
            <span className="text-green-500 text-xs font-medium self-center mr-2">
              1 completed
            </span>

            {/* Status Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setStatusPopoverOpen(!statusPopoverOpen)}
                className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-orange-100 transition-colors"
              >
                <span>◎</span> {goal.status}
              </button>

              {/* Status Popover Content */}
              <AnimatePresence>
                {statusPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20"
                  >
                    {["To-do", "In progress", "Completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2",
                              status === "To-do"
                                ? "border-gray-300"
                                : status === "In progress"
                                  ? "border-orange-500"
                                  : "border-green-500"
                            )}
                          >
                            {status === "In progress" && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full m-0.5" />
                            )}
                            {status === "Completed" && (
                              <div className="w-2 h-2 bg-green-500 rounded-full m-0.5" />
                            )}
                          </div>
                          <span>{status}</span>
                        </div>
                        {/* Add Checkbox logic here if needed, simplified for UI */}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {goal.categories.map((cat) => (
              <span
                key={cat}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5",
                  cat === "Regular"
                    ? "bg-teal-50 text-teal-600"
                    : "bg-pink-50 text-pink-600"
                )}
              >
                {cat === "Regular" ? "☆" : "Briefcase"} {cat}
              </span>
            ))}
          </div>

          {/* Shared With */}
          <div className="mb-10">
            <h4 className="text-sm text-gray-500 mb-3">Shared with</h4>
            <div className="space-y-2">
              {goal.sharedWith.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700",
                      user.color
                    )}
                  >
                    {user.avatar}
                  </div>
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Feed */}
          <div>
            <h4 className="text-sm text-gray-500 mb-4">Activities</h4>
            <div className="space-y-6 border-l-2 border-dashed border-gray-200 ml-4 pl-6 relative">
              {goal.activities.map((act, i) => (
                <div key={act.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-0 w-2.5 h-2.5 bg-gray-300 rounded-full ring-4 ring-white" />

                  <div className="flex items-start gap-3">
                    <img
                      src="https://placehold.co/100/EEDDAA/333?text=J"
                      alt="User"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{act.user}</span>{" "}
                        {act.action}{" "}
                        <span className="font-semibold">"{act.target}"</span>
                        {act.from && (
                          <span>
                            {" "}
                            from{" "}
                            <span className="font-semibold">
                              {act.from}
                            </span> to{" "}
                            <span className="font-semibold">{act.to}</span>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {act.date} {act.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-96 border-l border-gray-200 bg-white pl-4">
        <CalendarWidget
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
    </div>
  );
};
