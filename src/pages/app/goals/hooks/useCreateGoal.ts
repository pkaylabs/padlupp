import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGoal, CreateGoalPayload } from "../api";

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => createGoal(payload),

    onSuccess: () => {
      // 1. Refresh the 'goals' list immediately
      queryClient.invalidateQueries({ queryKey: ["goals"] });

      // Note: We don't show toast here because your UI has a custom Success Modal.
      // We will handle the UI success state in the component.
    },

    onError: (error: any) => {
      console.error("Failed to create goal", error);
      //   toast.error('Failed to create goal. Please try again.');
    },
  });
}
