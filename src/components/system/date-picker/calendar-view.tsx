// src/components/CalendarView.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { DateRange } from "react-day-picker";

interface CalendarViewProps {
  displayMonth: Date;
  onDisplayMonthChange: (date: Date) => void;
  selectedRange?: DateRange;
  onSelectRange: (range: DateRange | undefined) => void;
}

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const CalendarView: React.FC<CalendarViewProps> = ({
  displayMonth,
  onDisplayMonthChange,
  selectedRange,
  onSelectRange,
}) => {
  const firstDayOfMonth = startOfMonth(displayMonth);
  const lastDayOfMonth = endOfMonth(displayMonth);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  // Get the day of the week for the first day (0=Sun, 1=Mon, ...). We want Monday to be 0.
  const firstDayOfWeek = (getDay(firstDayOfMonth) + 6) % 7;

  // Create empty cells for padding
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const allDays = [...paddingDays, ...daysInMonth];

  const handlePrevMonth = () => {
    onDisplayMonthChange(subMonths(displayMonth, 1));
  };

  const handleNextMonth = () => {
    onDisplayMonthChange(addMonths(displayMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    if (!selectedRange || (selectedRange.from && selectedRange.to)) {
      // Start a new selection
      onSelectRange({ from: day, to: undefined });
    } else if (selectedRange.from && !selectedRange.to) {
      // Complete the selection
      if (day < selectedRange.from) {
        onSelectRange({ from: day, to: selectedRange.from });
      } else {
        onSelectRange({ from: selectedRange.from, to: day });
      }
    }
  };

  const getDayClass = (day: Date): string => {
    // Today
    if (isToday(day)) {
      return "bg-gray-200 text-gray-800 rounded-full";
    }
    // Selected Start/End or single day
    if (
      (selectedRange?.from && isSameDay(day, selectedRange.from)) ||
      (selectedRange?.to && isSameDay(day, selectedRange.to))
    ) {
      // Matches the "6" in the screenshot
      return "bg-blue-600 text-white rounded-full";
    }
    // In range
    if (
      selectedRange?.from &&
      selectedRange?.to &&
      isWithinInterval(day, {
        start: selectedRange.from,
        end: selectedRange.to,
      })
    ) {
      return "bg-blue-50";
    }
    return "hover:bg-gray-100 rounded-full";
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">
          {format(displayMonth, "MMM yyyy")}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Week Days */}
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-center text-gray-500"
          >
            {day}
          </div>
        ))}

        {/* Dates */}
        {allDays.map((day, index) => (
          <div key={index} className="flex justify-center items-center h-8">
            {day && (
              <button
                onClick={() => handleDayClick(day)}
                className={`w-8 h-8 flex items-center justify-center text-sm ${getDayClass(day)}`}
              >
                {format(day, "d")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
