import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getGoalInvitePreview,
  respondToGoalInvite,
  shareGoalInvites,
  type GoalInvitePreview,
  type ShareGoalInvitePayload,
} from "../api";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as {
    response?: { data?: { detail?: string } | string };
    message?: string;
  };
  const data = maybeError?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: string }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  if (typeof maybeError?.message === "string" && maybeError.message.trim()) {
    return maybeError.message;
  }
  return fallback;
};

export function useShareGoalInvites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      goalId,
      payload,
    }: {
      goalId: number | string;
      payload: ShareGoalInvitePayload;
    }) => shareGoalInvites(goalId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      toast.success(
        data?.detail ||
          `Invites sent${typeof data?.invited_count === "number" ? ` to ${data.invited_count} people` : ""}.`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to send goal invites."));
    },
  });
}

export function useGoalInvitePreview(token: string) {
  return useQuery<GoalInvitePreview>({
    queryKey: ["goal-invite-preview", token],
    queryFn: () => getGoalInvitePreview(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useRespondGoalInvite() {
  return useMutation({
    mutationFn: ({
      token,
      action,
    }: {
      token: string;
      action: "accept" | "decline";
    }) => respondToGoalInvite(token, action),
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === "accept"
          ? "Invite accepted successfully."
          : "Invite declined.",
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update invite status."));
    },
  });
}
