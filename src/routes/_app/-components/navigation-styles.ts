import { cn } from "@/utils/cs";

export const navItemClassName = (active = false) => cn(
  active
    ? "bg-primary-500 text-white font-semibold"
    : "text-dark-blue-normal dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-slate-800 hover:text-dark-blue-normal dark:hover:text-slate-100 font-medium",
  "group mx-2 flex items-center gap-x-3 rounded-sm px-3 py-2 text-sm leading-6 transition-all duration-150 ease-in-out",
);
