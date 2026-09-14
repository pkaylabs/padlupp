// src/components/onboarding/Step1Interests.tsx
import React, { useEffect, useState } from "react";
import {
  Book,
  Briefcase,
  CheckSquare,
  BarChart,
  HeartPulse,
  Palette,
} from "lucide-react";
import { SelectableTag } from "./select-tag";
import Button from "@/components/core/buttons";
import ButtonLoader from "@/components/loaders/button";
import { INTEREST_GROUPS } from "@/constants";

interface Step1Props {
  onContinue: (interests: string[]) => void;
  onBack: () => void;
  isPending: boolean;
  initialSelected?: string[];
}

const groupIcons = [Briefcase, Book, HeartPulse, CheckSquare, Palette, BarChart];

export const Step1Interests: React.FC<Step1Props> = ({
  onContinue,
  onBack,
  isPending,
  initialSelected = [],
}) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const toggleInterest = (label: string) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
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

      <div className="w-full mb-8 space-y-6 max-h-[52vh] overflow-y-auto pr-1">
        {INTEREST_GROUPS.map((group, groupIndex) => {
          const Icon = groupIcons[groupIndex];
          return (
            <section key={group.name} aria-labelledby={`interest-${groupIndex}`}>
              <h2 id={`interest-${groupIndex}`} className="mb-2 text-sm font-semibold text-gray-800">
                {group.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.interests.map((label) => (
                  <SelectableTag
                    key={`${group.name}-${label}`}
                    icon={<Icon size={18} />}
                    label={label}
                    isSelected={selected.includes(label)}
                    onClick={() => toggleInterest(label)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="w-full space-y-3">
        <Button
          variant="primary"
          onClick={() => onContinue(selected)}
          disabled={selected.length === 0 || isPending}
          className="w-full"
        >
          {isPending ? <ButtonLoader title="Setting up..." /> : "Continue"}
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isPending}
          className="w-full"
        >
          Back
        </Button>
      </div>
      {/* <Link
        to={DASHBOARD}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Skip for now.
      </Link> */}
    </div>
  );
};
