// src/components/DatePickerPopover.tsx
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, addWeeks } from "date-fns";
import { DateInput } from "./input";
import { PredefinedDates } from "./predefined-dates";
import { CalendarView } from "./calendar-view";

export const DatePickerPopover: React.FC = () => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2024, 11, 6), // Dec 6, 2024 (matching screenshot selection)
    to: undefined,
  });

  // This state controls the month being displayed in the calendar
  const [displayMonth, setDisplayMonth] = useState(new Date(2024, 11)); // Dec 2024

  const today = new Date();

  // This matches the "predefined" options on the left
  const predefinedDateOptions = [
    { label: "Today", range: { from: today, to: today }, secondary: "Wed" }, // Will dynamically get day
    { label: "Later", range: undefined, secondary: "8:am" }, // Custom logic needed
    {
      label: "Tomorrow",
      range: { from: addDays(today, 1), to: addDays(today, 1) },
      secondary: "Thu",
    },
    { label: "This weekend", range: undefined, secondary: "Sat" }, // Custom logic needed
    {
      label: "Next week",
      range: { from: addWeeks(today, 1), to: addWeeks(today, 1) },
      secondary: "Mon",
    },
    { label: "Next weekend", range: undefined, secondary: "4 Jan" }, // Custom logic
    {
      label: "2 weeks",
      range: { from: addWeeks(today, 2), to: addWeeks(today, 2) },
      secondary: "8 Jan",
    },
    {
      label: "4 weeks",
      range: { from: addWeeks(today, 4), to: addWeeks(today, 4) },
      secondary: "22 Jan",
    },
    {
      label: "6 weeks",
      range: { from: addWeeks(today, 6), to: addWeeks(today, 6) },
      secondary: "12 Feb",
    },
  ];

  return (
    <div className="w-[604px] h-[445px] bg-white rounded-lg shadow-xl border border-gray-200 flex overflow-hidden">
      {/* Left Panel: Predefined Dates */}
      <div className="w-60 border-r border-gray-200 p-4">
        <div className="flex space-x-2 mb-4">
          <DateInput value={range?.from} />
          <DateInput value={range?.to} />
        </div>
        <PredefinedDates
          options={predefinedDateOptions}
          onSelect={(selectedRange) => {
            if (selectedRange) {
              setRange(selectedRange);
              setDisplayMonth(selectedRange.from || new Date());
            }
          }}
        />
      </div>

      {/* Right Panel: Calendar View */}
      <div className="flex-1 p-4">
        <CalendarView
          displayMonth={displayMonth}
          onDisplayMonthChange={setDisplayMonth}
          selectedRange={range}
          onSelectRange={setRange}
        />
      </div>
    </div>
  );
};
