// src/components/onboarding/Step1Interests.tsx
import React, { useState } from "react";
import {
  Book,
  Smile,
  Plane,
  Coffee,
  Briefcase,
  Monitor,
  CheckSquare,
  BarChart,
  List,
  Projector,
} from "lucide-react";
import { SelectableTag } from "./select-tag";
import Button from "@/components/core/buttons";
import { Link } from "@tanstack/react-router";
import { DASHBOARD } from "@/constants/page-path";
import ButtonLoader from "@/components/loaders/button";

interface Step1Props {
  onContinue: (interests: string[]) => void;
  isPending: boolean;
}

const interestOptions = [
  { icon: <Book size={18} />, label: "Book and media" },
  { icon: <Smile size={18} />, label: "Hobbies" },
  { icon: <Plane size={18} />, label: "Travel" },
  { icon: <Coffee size={18} />, label: "Food and nutrition" },
  { icon: <Briefcase size={18} />, label: "Career building" },
  { icon: <Monitor size={18} />, label: "Site or blog" },
  { icon: <CheckSquare size={18} />, label: "Habit tracking" },
  { icon: <BarChart size={18} />, label: "Personal finance" },
  { icon: <List size={18} />, label: "To-do list" },
  { icon: <Projector size={18} />, label: "Project tracking" },
];

export const Step1Interests: React.FC<Step1Props> = ({
  onContinue,
  isPending,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (label: string) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        customize your experience
      </h1>
      <p className="text-gray-500 mb-6">Select all that applies.</p>
      <p className="text-gray-700 font-medium mb-4 w-full">
        {selected.length} selected
      </p>

      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        {interestOptions.map((item) => (
          <SelectableTag
            key={item.label}
            icon={item.icon}
            label={item.label}
            isSelected={selected.includes(item.label)}
            onClick={() => toggleInterest(item.label)}
          />
        ))}
      </div>

      <Button
        variant="primary"
        onClick={() => onContinue(selected)}
        disabled={selected.length === 0 || isPending}
        className="w-full"
      >
        {isPending ? <ButtonLoader title="Setting up..." /> : "Continue"}
      </Button>
      <Link
        to={DASHBOARD}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Skip for now.
      </Link>
    </div>
  );
};
