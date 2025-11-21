import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn: (...input: ClassValue[]) => string = (...input) => {
    return twMerge(clsx(...input));
  };