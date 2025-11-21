// src/data/kanbanData.ts
import { v4 as uuidv4 } from "uuid";

export type GoalStatus = "inProgress" | "todo" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[]; // e.g. "Regular", "Career building"
  date: string;
  time?: string;
  timeLeft?: string; // "58 Min Left"
  progress?: number; // 0-100
  priority?: "high" | "medium" | "low";
}

export interface Column {
  id: GoalStatus;
  title: string;
  color: string; // For the header dot
  items: Task[];
}

export type BoardData = Record<GoalStatus, Column>;

export const INITIAL_BOARD: BoardData = {
  inProgress: {
    id: "inProgress",
    title: "In Progress",
    color: "bg-orange-500",
    items: [
      {
        id: uuidv4(),
        title: "User Research",
        description: "Discussion on re-branding of demo Brand",
        tags: ["Regular", "Career building"],
        date: "23 Mar 2024",
        progress: 77,
      },
      {
        id: uuidv4(),
        title: "Change copies",
        description: "Change copies of website",
        tags: ["Regular", "Career building"],
        date: "23 Mar 2024",
        progress: 37,
      },
    ],
  },
  todo: {
    id: "todo",
    title: "To-do",
    color: "bg-primary-500",
    items: [
      {
        id: uuidv4(),
        title: "User Research",
        description: "Discussion on re-branding of demo Brand",
        tags: ["High priority", "Medium"],
        date: "23 Mar 2024",
        time: "1:30 pm",
        timeLeft: "58 Min Left",
      },
      {
        id: uuidv4(),
        title: "Brainstorming",
        description: "Discussion on re-branding of demo Brand",
        tags: ["Medium"],
        date: "23 Mar 2024",
        time: "12:45 pm",
        timeLeft: "12 Min Left",
      },
      {
        id: uuidv4(),
        title: "UI/UX testing",
        description: "Discussion on re-branding of demo Brand",
        tags: ["High priority", "Huge"],
        date: "25 Mar 2024",
        time: "10:00 am",
        timeLeft: "2 Days Left",
      },
    ],
  },
  completed: {
    id: "completed",
    title: "Completed",
    color: "bg-green-500",
    items: [
      {
        id: uuidv4(),
        title: "User Research",
        description: "Discussion on re-branding of demo Brand",
        tags: ["High priority", "Medium"],
        date: "20 Mar 2024",
      },
      {
        id: uuidv4(),
        title: "User Research",
        description: "Discussion on re-branding of demo Brand",
        tags: ["High priority", "Medium"],
        date: "19 Mar 2024",
      },
    ],
  },
};
