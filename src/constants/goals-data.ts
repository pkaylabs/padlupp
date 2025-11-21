// src/data/goalsMock.ts

import jadeAv from "@/assets/images/avatar1.png";
import {
  Airplane,
  CloudRemove,
  DocumentCode,
  Icon,
  Polyswarm,
} from "iconsax-reactjs";
import {
  Briefcase,
  Plane,
  Apple,
  List,
  Smile,
  Globe,
  Wallet,
  BookOpen,
  School,
  Check,
  TrendingUp,
  Circle,
  Sparkles,
} from "lucide-react";

// --- Types ---
export type GoalStatus = "todo" | "inProgress" | "completed";

export interface Person {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  compatibility: number;
  rating: number;
  seeking: string;
  interests: {
    icon: Icon;
    interest: string;
  }[];
}

export interface CommunityGoal {
  id: string;
  title: string;
  imageUrl: string;
  members: number;
  progress: number;
  subtasks: { text: string; due: string; time: string }[];
}

export interface Invitation {
  id: string;
  from: string;
  avatarUrl: string;
  type: "goal" | "profile";
  timestamp: string;
  date: string;
}

export interface GoalDetails {
  description: string;
  dateRange: string;
  subtasks: { text: string; completed: boolean }[];
  tags: { label: string; type: GoalStatus | "regular" }[];
}

// --- Mock Data ---

export const CATEGORIES_MOCK = [
  {
    label: "Career building",
    icon: Briefcase,
    color: "bg-pink-100",
    icon_color: "text-[#F56FAD] ",
  },
  {
    label: "Travel",
    icon: Plane,
    color: "bg-blue-100",
    icon_color: "text-[#4E92F4] ",
  },
  {
    label: "Nutrition",
    icon: Apple,
    color: "bg-green-100",
    icon_color: "text-[#BAD426] ",
  },
  {
    label: "To-do list",
    icon: List,
    color: "bg-yellow-100",
    icon_color: "text-[#D8C81F] ",
  },
  {
    label: "Hobbies",
    icon: Smile,
    color: "bg-teal-100",
    icon_color: "text-[#64F97B] ",
  },
  {
    label: "Site or blog",
    icon: Globe,
    color: "bg-purple-100",
    icon_color: "text-[#881CCE] ",
  },
  {
    label: "Finance",
    icon: Wallet,
    color: "bg-cyan-100",
    icon_color: "text-[#1FD8D8] ",
  },
  {
    label: "Book and media",
    icon: BookOpen,
    color: "bg-orange-100",
    icon_color: "text-[#1DB9C3] ",
  },
  {
    label: "Education",
    icon: School,
    color: "bg-red-100",
    icon_color: "text-[#FCB59A] ",
  },
  {
    label: "Habit tracking",
    icon: Check,
    color: "bg-indigo-100",
    icon_color: "text-[#2630EC] ",
  },
  {
    label: "Project tracking",
    icon: TrendingUp,
    color: "bg-pink-100",
    icon_color: "text-[#C31DAD] ",
  },
];

export const PEOPLE_MOCK: Person[] = [
  {
    id: "p1",
    name: "Jade",
    age: 25,
    avatarUrl: jadeAv,
    compatibility: 65,
    rating: 4,
    seeking: "learning Python, practicing three times a week.",
    interests: [
      { icon: CloudRemove, interest: "Hiking" },
      { icon: Polyswarm, interest: "Swimming" },
      { icon: DocumentCode, interest: "Python" },
      { icon: Airplane, interest: "Travel" },
    ],
  },
  {
    id: "p2",
    name: "Alex",
    age: 28,
    avatarUrl: "https://placehold.co/100x100/AADEED/333?text=A",
    compatibility: 75,
    rating: 5,
    seeking:
      "Looking for a buddy to track daily habits and share nutrition goals.",
    interests: [
      { icon: CloudRemove, interest: "Hiking" },
      { icon: Polyswarm, interest: "Swimming" },
      { icon: DocumentCode, interest: "Python" },
      { icon: Airplane, interest: "Travel" },
    ],
  },
];

export const COMMUNITY_MOCK: CommunityGoal[] = [
  {
    id: "c1",
    title: "Study python for 1 hour daily",
    imageUrl: "https://placehold.co/400x300/333/FFF?text=Python",
    members: 3,
    progress: 20,
    subtasks: [
      {
        text: "Lorem ipsum dolor sit amet consectetur.",
        due: "5 Apr",
        time: "01:40 PM",
      },
      {
        text: "Lorem ipsum dolor sit amet consectetur.",
        due: "5 Apr",
        time: "01:40 PM",
      },
    ],
  },
  {
    id: "c2",
    title: "Daily UI/UX Challenge",
    imageUrl: "https://placehold.co/400x300/5599FF/FFF?text=UI/UX",
    members: 12,
    progress: 45,
    subtasks: [
      {
        text: "Complete challenge #1: Sign up page.",
        due: "6 Apr",
        time: "11:00 PM",
      },
      {
        text: "Complete challenge #2: Pricing table.",
        due: "7 Apr",
        time: "11:00 PM",
      },
    ],
  },
];

export const INVITATIONS_MOCK: Invitation[] = [
  {
    id: "i1",
    from: "Ethan",
    avatarUrl: "https://placehold.co/40x40/DDAAEE/333?text=E",
    type: "goal",
    timestamp: "11:00am",
    date: "2nd Dec",
  },
  {
    id: "i2",
    from: "Ethan",
    avatarUrl: "https://placehold.co/40x40/DDAAEE/333?text=E",
    type: "profile",
    timestamp: "11:00am",
    date: "2nd Dec",
  },
  {
    id: "i3",
    from: "Ethan",
    avatarUrl: "https://placehold.co/40x40/DDAAEE/333?text=E",
    type: "goal",
    timestamp: "11:00am",
    date: "2nd Dec",
  },
];

export const GOAL_MOCK: GoalDetails = {
  description:
    "Lorem ipsum dolor sit amet consectetur. Purus convallis volutpat mollis vitae dolor posuere magna rutrum. Sed gravida interdum commodo purus tincidunt. Ultricies arcu sit scelerisque non massa. Sed ut mauris sagittis massa imperdiet volutpat. Nunc egestas tellus enim dignissim. Adipiscing ut aliquet dictum tincidunt lectus libero id velit. Et volutpat eget netus tellus facilisi. Quis sagittis sit scelerisque convallis urna blandit congue. Tempus nunc nibh justo et in ridiculus dui arcu in.",
  dateRange: "30th March, 2025 - 30th May, 2025",
  subtasks: [
    { text: "Lorem ipsum dolor sit amet consectetur.", completed: false },
    { text: "Lorem ipsum dolor sit amet consectetur.", completed: false },
    { text: "Lorem ipsum dolor sit amet consectetur.", completed: false },
    { text: "Lorem ipsum dolor sit amet consectetur.", completed: false },
  ],
  tags: [
    { label: "To-do", type: "todo" },
    { label: "Regular", type: "regular" },
    { label: "Career building", type: "inProgress" },
  ],
};
