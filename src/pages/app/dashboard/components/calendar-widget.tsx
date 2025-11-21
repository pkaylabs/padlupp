// src/components/dashboard/CalendarWidget.tsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isSameMonth,
  subDays,
  addDays,
  isBefore,
  startOfToday,
} from "date-fns";
import { cn } from "@/utils/cs";

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(selectedDate));

  // This is the *real* today
  const today = startOfToday();

  const firstDayOfMonth = startOfMonth(displayMonth);
  const lastDayOfMonth = endOfMonth(displayMonth);

  // Get Monday of the first week
  const firstDayOfWeek = (getDay(firstDayOfMonth) + 6) % 7;
  const startOfCalendar = subDays(firstDayOfMonth, firstDayOfWeek);

  // Get Sunday of the last week (ensure 6 weeks for consistent height)
  const endOfCalendar = addDays(startOfCalendar, 41); // 41 = 6 weeks - 1 day

  const allDays = eachDayOfInterval({
    start: startOfCalendar,
    end: endOfCalendar,
  });

  const handlePrevMonth = () => {
    setDisplayMonth(subMonths(displayMonth, 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(addMonths(displayMonth, 1));
  };

  const getDayClass = (day: Date): string => {
    const isPast = isBefore(day, today);
    const isCurrent = isSameDay(day, today);
    const isSelected = isSameDay(day, selectedDate);

    if (isSelected) {
      // The selected day (like "24" in screenshot)
      return "bg-primary-500 text-white rounded-full";
    }
    if (isPast && !isCurrent) {
      // Disabled past days
      return "text-gray-300 cursor-not-allowed";
    }
    if (!isSameMonth(day, displayMonth)) {
      // Days from other months
      return "text-gray-300";
    }
    if (isCurrent) {
      // Today (if not selected)
      return "text-blue-600 font-bold hover:bg-gray-100 rounded-full";
    }
    // Future, clickable days
    return "text-gray-700 hover:bg-gray-100 rounded-full";
  };

  return (
    <div className="sticky top-18 w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-monts font-semibold text-gray-800">
          {format(displayMonth, "MMM yyyy")}
        </span>
        <div className="flex">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {/* Week Days */}
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-xs font-medium text-gray-400">
            {day}
          </div>
        ))}

        {/* Dates */}
        {allDays.map((day, index) => {
          const isPast = isBefore(day, today);
          const isTodayFlag = isSameDay(day, today);

          return (
            <div key={index} className="flex justify-center items-center h-8">
              <button
                onClick={() => onDateSelect(day)}
                disabled={isPast && !isTodayFlag} // Can't click past days
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-sm",
                  getDayClass(day)
                )}
              >
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
