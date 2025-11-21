// src/data/chatMock.ts

export type MessageType = "text" | "goal_created" | "task_completed";

export interface Message {
  id: string;
  senderId: string;
  text: string; // Or description for system messages
  type: MessageType;
  timestamp: string;
  goalTitle?: string; // For system messages
  goalId?: string;
}

export interface Conversation {
  id: string;
  type: "personal" | "group";
  name: string;
  avatarUrl: string; // Or array for group
  isOnline?: boolean;
  members?: { id: string; avatarUrl: string }[]; // For group
  unreadCount: number;
  messages: Message[];
}

export const CURRENT_USER_ID = "me";

export const CHAT_MOCK_DATA: Conversation[] = [
  {
    id: "c1",
    type: "personal",
    name: "Jade",
    avatarUrl: "https://placehold.co/100x100/EEDDAA/333?text=J",
    isOnline: true,
    unreadCount: 5,
    messages: [
      {
        id: "m1",
        senderId: CURRENT_USER_ID,
        text: "Hello Jade! What can we work on?",
        type: "text",
        timestamp: "11:20am",
      },
      {
        id: "m2",
        senderId: "u2",
        text: "Design sprint?",
        type: "text",
        timestamp: "11:21am",
      },
      {
        id: "m3",
        senderId: "u2",
        text: "just created a goal",
        goalTitle: "Goal details",
        type: "goal_created",
        timestamp: "11:22am",
        goalId: "g1",
      },
      {
        id: "m4",
        senderId: CURRENT_USER_ID,
        text: "LGF",
        type: "text",
        timestamp: "11:22am",
      },
      {
        id: "m5",
        senderId: "u2",
        text: "Yessss! 🔥",
        type: "text",
        timestamp: "11:23am",
      },
      {
        id: "m6",
        senderId: "u2",
        text: "just completed a subtask!",
        type: "task_completed",
        timestamp: "11:24am",
        goalId: "g1",
      },
    ],
  },
  {
    id: "c2",
    type: "group",
    name: "Learning python",
    avatarUrl: "", // Group logic handles this
    unreadCount: 5,
    members: [
      { id: "u1", avatarUrl: "https://placehold.co/100/EEDDAA/333?text=J" },
      { id: "u2", avatarUrl: "https://placehold.co/100/336699/FFF?text=M" },
      { id: "u3", avatarUrl: "https://placehold.co/100/993333/FFF?text=K" },
    ],
    messages: [
      {
        id: "gm1",
        senderId: "system",
        text: "Almost there! A, B, and C have checked off their tasks for today! 🔥 Let’s keep it up!",
        type: "text", // Simplified as text for now, but styled as system box
        timestamp: "",
      },
      {
        id: "gm2",
        senderId: CURRENT_USER_ID,
        text: "Hello guys! I just joined can someone please bring me up to speed?",
        type: "text",
        timestamp: "11:20am",
      },
    ],
  },
];
