import React from "react";
import { cn } from "@/utils/cs";

interface StyledSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const StyledSwitch: React.FC<StyledSwitchProps> = ({
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
        checked
          ? "border-blue-500 bg-blue-500"
          : "border-gray-300 bg-gray-200 dark:border-slate-600 dark:bg-slate-700",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-[4px] size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
          checked ? "translate-x-[20px]" : "translate-x-[4px]",
        )}
      />
    </button>
  );
};
