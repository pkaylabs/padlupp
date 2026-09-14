import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateGoal, UpdateGoalPayload } from "../api";
import { getApiErrorMessage } from "@/utils/api-error";

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGoalPayload) => updateGoal(payload),
    onSuccess: () => {
      // Invalidate both the list and the specific goal
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update goal"));
    },
  });
}
