import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateGoal, UpdateGoalPayload } from "../api";

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGoalPayload) => updateGoal(payload),
    onSuccess: () => {
      // Invalidate both the list and the specific goal
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
    onError: () => {
      toast.error("Failed to update goal");
    },
  });
}
