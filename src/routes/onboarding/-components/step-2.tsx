// src/components/onboarding/Step2Goal.tsx
import React, { useState } from "react";
import { SelectableCard } from "./select-card";
import Button from "@/components/core/buttons";

interface Step2Props {
  onContinue: (goal: string) => void;
  isLoading?: boolean;
}

const goalOptions = [
  {
    emoji: "🏢",
    title: "Work",
    description: "Track your work progress, goals, growth",
  },
  {
    emoji: "🙋‍♀️",
    title: "Personal life",
    description: "Track your work progress, goals, growth",
  },
  {
    emoji: "🏫",
    title: "School",
    description: "Track your work progress, goals, growth",
  },
];

import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const Step2Goal: React.FC<Step2Props> = ({ onContinue, isLoading }) => {
  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-10">
        customize your experience
      </h1>

      <div className="space-y-4 w-full mb-10">
        {goalOptions.map((item) => (
          <SelectableCard
            key={item.title}
            emoji={item.emoji}
            title={item.title}
            description={item.description}
            isSelected={selected === item.title}
            onClick={() => setSelected(item.title)}
          />
        ))}
      </div>

      <Button
        variant="primary"
        onClick={() => onContinue(selected)}
        disabled={!selected || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            Saving...
            <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
          </span>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
};
