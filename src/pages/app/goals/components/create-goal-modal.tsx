// src/components/goals/modals/CreateGoalModal.tsx
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Plane,
  Apple,
  List,
  Smile,
  Globe,
  Wallet,
  BookOpen,
  School,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cs";
import {
  format,
  addDays,
  startOfToday,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { Modal } from "@/components/core/modal";
import { StyledSwitch } from "@/routes/_app/-components/toggle";
import Button from "@/components/core/buttons";
import { useCreateGoal } from "../hooks/useCreateGoal";
import ButtonLoader from "@/components/loaders/button";
import { useCreateTask } from "../hooks/useTasks";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PopoverType = "date" | "time" | "status" | "priority" | "category" | null;

// --- Mock Data for Popovers ---
const CATEGORIES = [
  {
    label: "Career building",
    icon: Briefcase,
    color: "bg-pink-100 text-pink-600",
  },
  { label: "Travel", icon: Plane, color: "bg-blue-100 text-blue-600" },
  { label: "Nutrition", icon: Apple, color: "bg-green-100 text-green-600" },
  { label: "To - do list", icon: List, color: "bg-yellow-100 text-yellow-600" },
  { label: "Hobbies", icon: Smile, color: "bg-green-50 text-green-500" },
  {
    label: "Site or blog",
    icon: Globe,
    color: "bg-purple-100 text-purple-600",
  },
  { label: "Finance", icon: Wallet, color: "bg-cyan-100 text-cyan-600" },
  { label: "Project tracking", icon: List, color: "bg-pink-50 text-pink-500" }, // Reusing list icon
  { label: "Book and media", icon: BookOpen, color: "bg-sky-100 text-sky-600" },
  {
    label: "Habit tracking",
    icon: CheckCircle2,
    color: "bg-indigo-100 text-indigo-600",
  },
  { label: "Education", icon: School, color: "bg-orange-100 text-orange-600" },
];

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { mutateAsync: createGoal, isPending: isCreatingGoal } =
    useCreateGoal();
  const { mutateAsync: createTask, isPending: isCreatingTask } =
    useCreateTask();

  const isPending = isCreatingGoal || isCreatingTask;

  const [activePopover, setActivePopover] = useState<PopoverType>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [time, setTime] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [status, setStatus] = useState("To-do");
  const [priority, setPriority] = useState("Regular");
  const [category, setCategory] = useState("Career building");
  const [isShared, setIsShared] = useState(true);

  // Subtask Input State
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const handleCreate = async () => {
    // Validation
    // if (!title.trim()) return toast.error("Title required");
    // if (!dateRange.start) return toast.error("Start date required");
    if (!title.trim()) return;
    if (!dateRange.start) return;

    try {
      // Step A: Create the Goal
      const goalPayload = {
        title,
        description,
        start_date: format(dateRange.start, "yyyy-MM-dd"),
        target_date: dateRange.end
          ? format(dateRange.end, "yyyy-MM-dd")
          : format(dateRange.start, "yyyy-MM-dd"),
        status,
        is_active: true,
      };

      // We await the result to get the new Goal's ID
      const newGoal = await createGoal(goalPayload);

      // Step B: Create Subtasks (if any)
      if (subtasks.length > 0 && newGoal?.id) {
        // We use Promise.all to send them in parallel for speed
        await Promise.all(
          subtasks.map((taskTitle) =>
            createTask({
              goal: newGoal.id, // Link to the new goal
              title: taskTitle,
              partnership: 0, // Default as per requirements
              description: "", // Default
              status: "planned",
              is_shared: isShared,
              // Defaulting due date to Goal's target date since subtask doesn't have its own picker
              due_at: newGoal.target_date
                ? new Date(newGoal.target_date).toISOString()
                : new Date().toISOString(),
            }),
          ),
        );
      }

      // Step C: Success UI
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset Form
        setTitle("");
        setDescription("");
        setSubtasks([]);
      }, 2000);
    } catch (error) {
      console.error("Creation flow failed", error);
      // Toast is handled in the hooks, but you can add a generic fallback here
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtask("");
      setIsAddingSubtask(false);
    }
  };

  // --- RENDER HELPERS ---

  const BadgeButton = ({
    label,
    icon,
    type,
    color,
  }: {
    label: string;
    icon: string;
    type: PopoverType;
    color: string;
  }) => (
    <button
      onClick={() => setActivePopover(activePopover === type ? null : type)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 relative",
        color,
        activePopover === type && "ring-2 ring-offset-1 ring-blue-200",
      )}
    >
      <span>{icon}</span> {label}
    </button>
  );

  // --- SUCCESS VIEW ---
  if (isSuccess) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {}}
        className="max-w-md w-full p-12 flex flex-col items-center justify-center top-1/2 -translate-y-1/2 "
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>
        <h2 className="text-lg font-medium text-gray-600">
          Your goal has been created!
        </h2>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="max-w-xl w-full p-8 overflow-visible top-1/2 -translate-y-1/2"
    >
      <div className="relative">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          Create goal
        </h2>

        <div className="space-y-6">
          {/* Title & Desc */}
          <div className="space-y-1">
            <label className="text-lg font-semibold text-gray-900">
              Title...
            </label>
            <input
              type="text"
              value={title}
              disabled={isPending}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b border-gray-200 pb-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Learn React Hooks"
            />
          </div>
          <div>
            <input
              type="text"
              value={description}
              disabled={isPending}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-none p-2 text-sm text-gray-600 placeholder:text-gray-400  outline-none focus:outline-none"
              placeholder="Description"
            />
          </div>

          {/* Triggers */}
          <div className="space-y-4 relative">
            {/* Date Trigger */}
            <div className="relative">
              <button
                disabled={isPending}
                onClick={() =>
                  setActivePopover(activePopover === "date" ? null : "date")
                }
                className="flex items-center gap-3 text-gray-500 hover:text-gray-800 text-sm font-medium"
              >
                <Calendar size={18} />{" "}
                {dateRange.start
                  ? `${format(dateRange.start, "MMM d")} - ${dateRange.end ? format(dateRange.end, "MMM d") : "..."}`
                  : "Add dates"}
              </button>
              {/* DATE POPOVER */}
              <AnimatePresence>
                {activePopover === "date" && (
                  <DatePickerView
                    disabled={isPending}
                    range={dateRange}
                    onChange={(r: any) => {
                      setDateRange(
                        r,
                      ); /* Don't close immediately to allow range selection */
                    }}
                    onClose={() => setActivePopover(null)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Time Trigger */}
            <div className="relative">
              <button
                disabled={isPending}
                onClick={() =>
                  setActivePopover(activePopover === "time" ? null : "time")
                }
                className="flex items-center gap-3 text-gray-500 hover:text-gray-800 text-sm font-medium"
              >
                <Clock size={18} /> {time || "Add time"}
              </button>
              {/* TIME POPOVER */}
              <AnimatePresence>
                {activePopover === "time" && (
                  <TimePickerView
                    onSave={(t: any) => {
                      setTime(t);
                      setActivePopover(null);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            {subtasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700 group"
              >
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                <span className="flex-1">{task}</span>
                <button
                  disabled={isPending}
                  onClick={() =>
                    setSubtasks(subtasks.filter((_, i) => i !== idx))
                  }
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {isAddingSubtask ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  className="flex-1 text-sm border-b border-blue-500 focus:outline-none py-1"
                  placeholder="Enter subtask..."
                  disabled={isPending}
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                />
                <button
                  disabled={isPending}
                  onClick={addSubtask}
                  className="text-blue-600 text-xs font-medium"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                disabled={isPending}
                onClick={() => setIsAddingSubtask(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm"
              >
                <Plus size={16} /> Add subtask
              </button>
            )}
          </div>

          {/* Badges & Popovers */}
          <div className="relative flex flex-wrap gap-3 pt-2">
            <div className="relative">
              <BadgeButton
                label={status}
                type="status"
                color="bg-yellow-100 text-yellow-700"
                icon="◎"
              />
              <AnimatePresence>
                {activePopover === "status" && (
                  <SelectionPopover
                    title=""
                    options={["To-do", "In progress", "Completed"]}
                    colors={[
                      "text-blue-500",
                      "text-orange-500",
                      "text-green-500",
                    ]}
                    selected={status}
                    onSelect={(s: any) => {
                      setStatus(s);
                      setActivePopover(null);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <BadgeButton
                label={priority}
                type="priority"
                color="bg-purple-100 text-purple-700"
                icon="☆"
              />
              <AnimatePresence>
                {activePopover === "priority" && (
                  <SelectionPopover
                    title=""
                    options={[
                      "Urgent",
                      "Important",
                      "Regular",
                      "Not important",
                    ]}
                    colors={[
                      "text-red-500",
                      "text-orange-400",
                      "text-teal-500",
                      "text-green-500",
                    ]}
                    icons={true}
                    selected={priority}
                    onSelect={(s: any) => {
                      setPriority(s);
                      setActivePopover(null);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <BadgeButton
                label={category}
                type="category"
                color="bg-blue-100 text-blue-700"
                icon="≔"
              />
              <AnimatePresence>
                {activePopover === "category" && (
                  <CategoryPopover
                    selected={category}
                    onSelect={(c: any) => {
                      setCategory(c);
                      setActivePopover(null);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Share Toggle */}
          <div className="flex items-center gap-3 py-2">
            <span className="text-sm text-gray-700">
              Share goal with someone
            </span>
            <StyledSwitch checked={isShared} onChange={setIsShared} />
          </div>

          {/* Action Button */}
          <Button
            disabled={isPending}
            variant="primary"
            className="w-full py-3 mt-4"
            onClick={handleCreate}
          >
            {isPending ? (
              <ButtonLoader title="Creating Goal..." />
            ) : isShared ? (
              "Find me a partner"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ----------------------------------------------------------------------
// SUB-COMPONENTS (POPOVERS)
// ----------------------------------------------------------------------

// 1. DATE PICKER (Complex Layout)
const DatePickerView = ({ range, onChange, onClose }: any) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const padding = Array.from({ length: getDay(startOfMonth(currentMonth)) });

  const handleDayClick = (day: Date) => {
    if (!range.start || (range.start && range.end)) {
      onChange({ start: day, end: undefined });
    } else {
      if (day < range.start) onChange({ start: day, end: range.start });
      else onChange({ start: range.start, end: day });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-8 left-0 z-50 bg-white shadow-xl rounded-xl border border-gray-100 flex overflow-hidden w-[600px]"
    >
      {/* Sidebar */}
      <div className="w-40 bg-gray-50 p-4 flex flex-col gap-2 border-r border-gray-100">
        {["Today", "Later", "Tomorrow", "This weekend", "Next week"].map(
          (l) => (
            <button
              key={l}
              className="text-left text-sm text-gray-600 hover:bg-gray-100 px-2 py-1.5 rounded"
            >
              {l}
            </button>
          ),
        )}
      </div>
      {/* Calendar */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentMonth((d) => addDays(d, -30))}>
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-sm">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <button onClick={() => setCurrentMonth((d) => addDays(d, 30))}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-400">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {padding.map((_, i) => (
            <div key={i} />
          ))}
          {days.map((day) => {
            const isSelected =
              (range.start && isSameDay(day, range.start)) ||
              (range.end && isSameDay(day, range.end));
            const isInRange =
              range.start &&
              range.end &&
              isWithinInterval(day, { start: range.start, end: range.end });
            return (
              <button
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "w-8 h-8 text-sm rounded-full flex items-center justify-center hover:bg-gray-100",
                  isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                  isInRange && !isSelected && "bg-blue-50",
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// 2. TIME PICKER (Interactive)
const TimePickerView = ({ onSave }: { onSave: (time: string) => void }) => {
  // State for Hours, Minutes, Seconds
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  // Helper to handle input changes
  const handleChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    max: number,
  ) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    // Limit length to 2
    if (numericValue.length <= 2) {
      if (parseInt(numericValue || "0") <= max) {
        setter(numericValue);
      }
    }
  };

  // Helper to format on blur (e.g., turn "1" into "01")
  const handleBlur = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(value.padStart(2, "0"));
  };

  // Reusable Input Component
  const TimeInput = ({
    value,
    onChange,
    max,
  }: {
    value: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    max: number;
  }) => (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => handleChange(e.target.value, onChange, max)}
      onBlur={(e) => handleBlur(e.target.value, onChange)}
      className="w-12 h-12 border border-gray-200 rounded-lg text-center text-xl font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      placeholder="00"
    />
  );

  const handleSave = () => {
    // Ensure format is HH:MM:SS
    const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    onSave(formattedTime);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-8 left-0 z-50 bg-white shadow-xl rounded-xl border border-gray-100 p-6 w-auto min-w-[280px]"
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        {/* Hours */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Hr
          </span>
          <TimeInput value={hours} onChange={setHours} max={23} />
        </div>

        <span className="text-2xl font-medium text-gray-300 mt-4">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Min
          </span>
          <TimeInput value={minutes} onChange={setMinutes} max={59} />
        </div>

        <span className="text-2xl font-medium text-gray-300 mt-4">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Sec
          </span>
          <TimeInput value={seconds} onChange={setSeconds} max={59} />
        </div>
      </div>

      <Button variant="primary" className="w-full" onClick={handleSave}>
        Done
      </Button>
    </motion.div>
  );
};

// 3. GENERIC SELECTION POPOVER (Status/Priority)
const SelectionPopover = ({
  options,
  selected,
  onSelect,
  colors,
  icons,
}: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      className="absolute bottom-full mb-2 left-0 z-50 bg-white shadow-xl rounded-xl border border-gray-100 p-2 w-48"
    >
      {options.map((opt: string, idx: number) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-between text-sm"
        >
          <span className="flex items-center gap-2">
            {icons ? (
              <span className={cn(colors[idx])}>★</span> // Star icon for priority
            ) : (
              <div
                className={cn(
                  "w-2 h-2 rounded-full ring-2 ring-offset-1",
                  colors[idx].replace("text", "bg").replace("500", "400"),
                )}
              />
            )}
            <span className={cn(colors[idx])}>{opt}</span>
          </span>
          {selected === opt && (
            <CheckCircle2 size={14} className="text-blue-500" />
          )}
        </button>
      ))}
    </motion.div>
  );
};

// 4. CATEGORY POPOVER (Grid)
const CategoryPopover = ({ selected, onSelect }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      className="absolute bottom-full mb-2 left-0 z-50 bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 w-80"
    >
      <div className="grid grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => onSelect(cat.label)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                cat.color,
                selected === cat.label
                  ? "ring-2 ring-offset-1 ring-blue-300"
                  : "group-hover:scale-105",
              )}
            >
              <cat.icon size={20} />
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
