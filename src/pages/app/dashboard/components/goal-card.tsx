// src/components/dashboard/GoalCard.tsx
import React from "react";
import {
  Clock,
  Circle,
  TrendingUp,
  Sparkles,
  Briefcase,
  AlarmClock,
} from "lucide-react";
import { cn } from "@/utils/cs";
import { Calendar } from "iconsax-reactjs";

// --- Sub-Components for Tags ---

// Type for the main status tag
type GoalStatus = "todo" | "inProgress" | "completed";

// Component for the "To-do" or "In progress" tag
const StatusTag: React.FC<{ type: GoalStatus }> = ({ type }) => {
  const styles = {
    todo: {
      bg: "bg-[#4E92F426] ",
      text: "text-blue-700",
      border: "border-primary-500",
      border_bg: "bg-primary-500",
      icon: <Circle size={14} className="text-blue-700" fill="currentColor" />,
      label: "To-do",
    },
    inProgress: {
      bg: "bg-[#FCB59A26] ",
      text: "text-[#EB612C]",
      border: "border-[#EB612C]",
      border_bg: "bg-[#EB612C]",
      icon: <TrendingUp size={14} className="text-red-700" />,
      label: "In progress",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <Circle size={14} className="text-green-700" />, // Replace with check
      label: "Completed",
    },
  }[type];

  return (
    <div
      className={cn(
        "font-monts flex items-center gap-1.5 p-3 rounded-lg ",
        styles.bg
      )}
    >
      {/* {styles.icon} */}
      <div
        className={cn(
          "flex justify-center items-center size-4 rounded-full border  bg-transparent",
          styles.border
        )}
      >
        <div className={cn("size-2 rounded-full", styles.border_bg)}></div>
      </div>

      <span className={cn("text-[10px] text-nowrap font-medium", styles.text)}>
        {styles.label}
      </span>
    </div>
  );
};

// Component for the "Regular" or "Career building" tags
const CategoryTag: React.FC<{ label: string }> = ({ label }) => {
  const isRegular = label.toLowerCase() === "regular";
  const Icon = isRegular ? Sparkles : Briefcase;
  const colors = isRegular
    ? "bg-green-100 text-green-700"
    : "bg-pink-100 text-pink-700";

  return (
    <div
      className={cn(
        "font-monts flex items-center gap-1.5 p-3 rounded-lg",
        colors
      )}
    >
      <Icon size={14} />
      <span className="text-[10px] text-nowrap font-medium">{label}</span>
    </div>
  );
};

// Component for the bottom row items
const InfoItem: React.FC<{ icon: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <div className="font-monts flex items-center gap-2 text-gray-500">
    <div className="flex justify-center items-center size-9 rounded-full border border-[#D6D6D6] bg-white shadow ">
      {icon}
    </div>

    <span className="text-xs sm:text-sm font-medium text-[#44424C] ">
      {text}
    </span>
  </div>
);

// --- Main GoalCard Component ---

interface GoalCardProps {
  title: string;
  subtitle: string;
  timeLeft: string;
  status: GoalStatus;
  categories: string[];
  date: string;
  time: string;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title,
  subtitle,
  timeLeft,
  status,
  categories,
  date,
  time,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md  border border-gray-100 space-y-4 overflow-hidden">
      {/* Top row: Time Left */}
      <div className="pt-5 px-5 space-y-4">
        <div className="w-fit flex items-center gap-1.5 px-3 py-1 rounded-sm bg-primary-500 text-white">
          <Clock size={14} />
          <span className="text-xs font-medium">{timeLeft}</span>
        </div>

        {/* Title and Subtitle */}
        <div className="font-monts space-y-1">
          <h3 className=" sm:text-lg font-medium text-[#3D3D3D] ">{title}</h3>
          <p className="text-sm text-[#838181] ">{subtitle}</p>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2">
          <StatusTag type={status} />
          {categories.map((cat) => (
            <CategoryTag key={cat} label={cat} />
          ))}
        </div>
      </div>

      {/* Bottom row: Date and Time <AlarmClock /> */}
      <div className="flex items-center justify-between bg-[#F5F6F8] p-5 rounded-2xl ">
        <InfoItem icon={<Calendar size={18} color="#4E92F4" />} text={date} />
        <InfoItem icon={<AlarmClock size={18} color="#F29268" />} text={time} />
      </div>
    </div>
  );
};
