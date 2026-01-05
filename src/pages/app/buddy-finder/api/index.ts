import { api } from "@/lib/api";

// --- Shared Types ---

interface User {
  id: number;
  email: string;
  phone: string;
  name: string;
  avatar: string;
  phone_verified: boolean;
  email_verified: boolean;
}

// 1. Established Connection
export interface BuddyConnection {
  id: number;
  user: User;
  bio: string;
  location: string;
  experience: string;
  interests: string[];
  time_zone: string;
  focus_areas: string;
  availability: string;
  communication_styles: string;
  created_at: string;
  updated_at: string;
}

// 2. Potential Buddy (Finder)
// Extends Connection but adds status fields
export interface PotentialBuddy extends BuddyConnection {
  connection_status: "none" | "pending" | "connected"; // Adjust based on actual values
  buddy_request_id: number | null;
}

// 3. Invitation
export interface BuddyInvitation {
  id: number; // This is the ID used for accept/reject
  from_user: User;
  to_user: User;
  status: "pending" | "accepted" | "rejected";
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- API Functions ---

// GET: My Connections
export const getConnections = async () => {
  const { data } = await api.get<BuddyConnection[]>("/buddies/connections/");
  return data;
};

// GET: Buddy Finder (Discovery)
export const getBuddyFinder = async () => {
  const { data } = await api.get<PotentialBuddy[]>("/buddies/finder/");
  return data;
};

// GET: Pending Invitations
export const getInvitations = async () => {
  const { data } = await api.get<BuddyInvitation[]>("/buddies/invitations/");
  return data;
};

// POST: Send Request
export const sendConnectionRequest = async (toUserId: number) => {
  const { data } = await api.post("/buddies/connect/", { to_user: toUserId });
  return data;
};

// POST: Accept Request
export const acceptInvitation = async (invitationId: string | number) => {
  const { data } = await api.post(`/buddies/${invitationId}/accept/`);
  return data;
};

// POST: Reject Request
export const rejectInvitation = async (invitationId: string | number) => {
  const { data } = await api.post(`/buddies/${invitationId}/reject/`);
  return data;
};
