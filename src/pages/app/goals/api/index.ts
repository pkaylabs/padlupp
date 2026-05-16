import { api } from "@/lib/api";

// --- 1. Domain Types ---

export interface User {
  id: number;
  email: string;
  phone: string;
  name: string;
  avatar: string;
  phone_verified: boolean;
  email_verified: boolean;
}

export interface GoalPartner {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface Goal {
  id: number;
  user: User;
  partnership?: number | null;
  partner?: GoalPartner | null;
  partner_name?: string | null;
  partner_avatar?: string | null;
  title: string;
  category?: string | null;
  importance?: string | null;
  checkin_frequency?: CheckinFrequency | null;
  public_share_link?: string | null;
  share_link?: string | null;
  invite_link?: string | null;
  description: string;
  start_date: string; // ISO Date string
  start_time?: string | null;
  target_date: string; // ISO Date string
  is_active: boolean;
  is_public?: boolean;
  is_shared?: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

// --- 2. API Request/Response Types ---

// Generic Pagination Wrapper (Reusable for other endpoints)
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GetGoalsParams {
  page?: number;
  search?: string;
  ordering?: string; // e.g. "created_at" or "-created_at"
}

export interface CreateGoalPayload {
  title: string;
  description: string;
  start_date: string; // Format: YYYY-MM-DD
  start_time?: string; // Format: HH:mm:ss
  target_date: string; // Format: YYYY-MM-DD
  category?: string;
  importance?: string;
  checkin_frequency: CheckinFrequency;
  is_active: boolean;
  is_public: boolean;
  status: string;
  conversation?: number;
}

export type CheckinFrequency =
  | "DAILY"
  | "3-DAYS"
  | "WEEKLY"
  | "BI-WEEKLY"
  | "MONDAYS"
  | "TUESDAYS"
  | "WEDNESDAYS"
  | "THURSDAYS"
  | "FRIDAYS"
  | "SATURDAYS"
  | "SUNDAYS";

export const CHECKIN_FREQUENCIES: CheckinFrequency[] = [
  "DAILY",
  "3-DAYS",
  "WEEKLY",
  "BI-WEEKLY",
  "MONDAYS",
  "TUESDAYS",
  "WEDNESDAYS",
  "THURSDAYS",
  "FRIDAYS",
  "SATURDAYS",
  "SUNDAYS",
];

export interface Task {
  id: number;
  goal: number;
  partnership: number;
  owner: number;
  title: string;
  description: string;
  due_at: string;
  status: "planned" | "in-progress" | "completed"; // Adjust based on strict backend types
  is_shared: boolean;
  is_overdue: boolean;
  completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetTasksParams {
  page?: number;
  search?: string;
  ordering?: string;
}

export interface CreateTaskPayload {
  goal: number; // The Parent ID
  partnership?: number; // Optional or 0
  title: string;
  description?: string;
  due_at?: string;
  status?: string;
  is_shared?: boolean;
}

export interface UpdateTaskPayload {
  id: string | number;
  data: Partial<{
    title: string;
    description: string;
    due_at: string;
    status: string;
    is_shared: boolean;
    completed: boolean;
  }>;
}

export interface UpdateGoalPayload {
  id: string | number;
  data: Partial<Omit<Goal, "id" | "user">>; // Allow updating any field except ID/User
}

export interface ShareGoalInvitePayload {
  emails: string[];
  message?: string;
}

export interface ShareGoalInviteResponse {
  detail?: string;
  invited_count?: number;
  public_share_link?: string | null;
  share_link?: string | null;
  invite_link?: string | null;
}

export interface GoalInvitePreview {
  id?: number;
  token?: string;
  status?: "pending" | "accepted" | "declined" | "expired";
  goal: {
    id: number;
    title: string;
    description?: string | null;
    category?: string | null;
    target_date?: string | null;
  };
  inviter?: {
    id?: number;
    name?: string | null;
    avatar?: string | null;
  } | null;
  message?: string | null;
}

export const getGoals = async (
  params: GetGoalsParams,
): Promise<PaginatedResponse<Goal>> => {
  const { data } = await api.get<PaginatedResponse<Goal>>("/goals/", {
    params,
  });
  return data;
};

export const createGoal = async (payload: CreateGoalPayload): Promise<Goal> => {
  const { data } = await api.post<Goal>("/goals/", payload);
  return data;
};

export const getGoal = async (id: string): Promise<Goal> => {
  const { data } = await api.get<Goal>(`/goals/${id}/`);
  return data;
};

export const getTasks = async (params: GetTasksParams) => {
  const { data } = await api.get<PaginatedResponse<Task>>("/tasks/", {
    params,
  });
  return data;
};

export const createTask = async (payload: CreateTaskPayload) => {
  const { data } = await api.post<Task>("/tasks/", payload);
  return data;
};

export const updateTask = async ({
  id,
  data,
}: UpdateTaskPayload): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${id}/`, data);
  return response.data;
};

export const deleteTask = async (id: string | number): Promise<void> => {
  await api.delete(`/tasks/${id}/`);
};

export const updateGoal = async ({
  id,
  data,
}: UpdateGoalPayload): Promise<Goal> => {
  const response = await api.patch<Goal>(`/goals/${id}/`, data);
  return response.data;
};

export const deleteGoal = async (id: string | number): Promise<void> => {
  await api.delete(`/goals/${id}/`);
};

export const shareGoalInvites = async (
  goalId: string | number,
  payload: ShareGoalInvitePayload,
): Promise<ShareGoalInviteResponse> => {
  const { data } = await api.post<ShareGoalInviteResponse>(
    `/goals/${goalId}/share/`,
    payload,
  );
  return data;
};

export const getGoalInvitePreview = async (
  token: string,
): Promise<GoalInvitePreview> => {
  const { data } = await api.get<GoalInvitePreview>(`/goals/invite/${token}/`);
  return data;
};

export const respondToGoalInvite = async (
  token: string,
  action: "accept" | "decline",
): Promise<{ detail?: string }> => {
  const { data } = await api.post<{ detail?: string }>(
    `/goals/invite/${token}/respond/`,
    { action },
  );
  return data;
};

export interface GoalPreview {
  id: number;
  title: string;
  description: string;
  category?: string | null;
  importance?: string | null;
  start_date: string;
  target_date: string;
  is_public: boolean;
  status: string;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  partner?: {
    id: number;
    name: string;
    avatar?: string | null;
  } | null;
  partner_name?: string | null;
  partner_avatar?: string | null;
  created_at: string;
}

export const getGoalPreview = async (
  id: string | number,
): Promise<GoalPreview> => {
  const { data } = await api.get<GoalPreview>(`/goals/${id}/`);
  return data;
};

export const joinGoal = async (
  goalId: string | number,
): Promise<{ detail?: string }> => {
  const { data } = await api.post<{ detail?: string }>("/goals/join-goal/", {
    goal: goalId,
  });
  return data;
};
