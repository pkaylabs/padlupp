import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getGoalCheckins,
	reactToGoalCheckin,
	submitGoalCheckin,
	type SubmitGoalCheckinPayload,
} from "../api";
import { getApiErrorMessage } from "@/utils/api-error";

export const useGoalCheckins = (goalId?: string | number) =>
	useQuery({
		queryKey: ["goal-checkins", goalId],
		queryFn: () => getGoalCheckins(goalId!),
		enabled: Boolean(goalId),
	});

export const useSubmitGoalCheckin = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: SubmitGoalCheckinPayload) => submitGoalCheckin(payload),
		onSuccess: (checkin) => {
			queryClient.invalidateQueries({ queryKey: ["goal-checkins", checkin.goal] });
			toast.success("Check-in shared with your Paddie Pod.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Could not submit check-in.")),
	});
};

export const useReactToGoalCheckin = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ checkinId, reaction }: { checkinId: number; reaction: "support" | "celebrate" }) =>
			reactToGoalCheckin(checkinId, reaction),
		onSuccess: (checkin) => {
			queryClient.invalidateQueries({ queryKey: ["goal-checkins", checkin.goal] });
		},
	});
};
