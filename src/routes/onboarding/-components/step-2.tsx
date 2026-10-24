// src/components/onboarding/Step2Goal.tsx
import React, { useEffect, useState } from "react";
import { SelectableCard } from "./select-card";
import Button from "@/components/core/buttons";
import ButtonLoader from "@/components/loaders/button";

interface Step2Props {
  onContinue: (goal: string) => void;
  initialGoal?: string;
  isPending?: boolean;
  onChange?: (goal: string) => void;
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

export const Step2Goal: React.FC<Step2Props> = ({
  onContinue,
  initialGoal = "",
  isPending = false,
  onChange,
}) => {
  const [selected, setSelected] = useState(initialGoal);

  useEffect(() => {
    setSelected(initialGoal);
  }, [initialGoal]);

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
            onClick={() => {
              if (isPending) return;
              const next = selected === item.title ? "" : item.title;
              setSelected(next);
              onChange?.(next);
            }}
          />
        ))}
      </div>

      <Button
        variant="primary"
        onClick={() => onContinue(selected)}
        disabled={!selected || isPending}
        className="w-full"
      >
        {isPending ? <ButtonLoader title="Saving..." /> : "Continue"}
      </Button>
    </div>
  );
};
