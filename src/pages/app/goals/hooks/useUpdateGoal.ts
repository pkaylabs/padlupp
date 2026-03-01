import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateGoal, UpdateGoalPayload } from "../api";

const getApiErrorMessage = (error: any): string => {
  const data = error?.response?.data;

  if (!data) return "Failed to update goal";

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

  return "Failed to update goal";
};

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGoalPayload) => updateGoal(payload),
    onSuccess: () => {
      // Invalidate both the list and the specific goal
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
