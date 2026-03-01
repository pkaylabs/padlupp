import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTask,
  CreateTaskPayload,
  deleteTask,
  getTasks,
  GetTasksParams,
  updateTask,
  UpdateTaskPayload,
} from "../api";
import { toast } from "sonner";

const getApiErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object") {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (typeof first === "string" && first.trim()) {
          return first;
        }
      }
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return fallback;
};

// Hook for fetching list
export function useTasks(params: GetTasksParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => getTasks(params),
    placeholderData: keepPreviousData,
  });
}

// Hook for creating a single task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, "Failed to create subtask"));
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => updateTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, "Failed to update subtask"));
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, "Failed to delete subtask"));
    },
  });
}
