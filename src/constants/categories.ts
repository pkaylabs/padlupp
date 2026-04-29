import {
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type CoreCategory = "Career" | "Business" | "Study" | "Personal Growth";

export type CategoryOption = {
  label: CoreCategory;
  icon: LucideIcon;
  color: string;
  icon_color: string;
};

export const CORE_CATEGORIES: CategoryOption[] = [
  {
    label: "Career",
    icon: Briefcase,
    color: "bg-pink-100",
    icon_color: "text-[#F56FAD]",
  },
  {
    label: "Business",
    icon: Building2,
    color: "bg-blue-100",
    icon_color: "text-[#4E92F4]",
  },
  {
    label: "Study",
    icon: GraduationCap,
    color: "bg-orange-100",
    icon_color: "text-[#FCB59A]",
  },
  {
    label: "Personal Growth",
    icon: Sparkles,
    color: "bg-indigo-100",
    icon_color: "text-[#2630EC]",
  },
];

const LEGACY_CATEGORY_MAP: Record<string, CoreCategory> = {
  "career building": "Career",
  work: "Career",
  "personal life": "Personal Growth",
  travel: "Personal Growth",
  nutrition: "Personal Growth",
  "to - do list": "Personal Growth",
  "to-do list": "Personal Growth",
  hobbies: "Personal Growth",
  "site or blog": "Business",
  finance: "Business",
  "book and media": "Study",
  education: "Study",
  "habit tracking": "Personal Growth",
  "project tracking": "Business",
};

export const normalizeCategory = (value?: string | null): CoreCategory => {
  const trimmed = (value || "").trim();
  if (!trimmed) return "Career";

  const exact = CORE_CATEGORIES.find((item) => item.label === trimmed);
  if (exact) return exact.label;

  const mapped = LEGACY_CATEGORY_MAP[trimmed.toLowerCase()];
  return mapped || "Career";
};
