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

export interface Goal {
  id: number;
  user: User;
  title: string;
  description: string;
  start_date: string; // ISO Date string
  target_date: string; // ISO Date string
  is_active: boolean;
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
  target_date: string; // Format: YYYY-MM-DD
  is_active: boolean;
  status: string;
}

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

export interface UpdateGoalPayload {
  id: string | number;
  data: Partial<Omit<Goal, "id" | "user">>; // Allow updating any field except ID/User
}

export const getGoals = async (
  params: GetGoalsParams
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

export const updateGoal = async ({
  id,
  data,
}: UpdateGoalPayload): Promise<Goal> => {
  const response = await api.patch<Goal>(`/goals/${id}/`, data);
  return response.data;
};
