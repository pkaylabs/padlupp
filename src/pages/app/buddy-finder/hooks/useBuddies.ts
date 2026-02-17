import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  getBuddyFinder,
  getConnections,
  getInvitations,
  rejectInvitation,
  sendConnectionRequest,
} from "../api";
import { toast } from "sonner";

// --- QUERIES (GET) ---

export function useConnections() {
  return useQuery({
    queryKey: ["buddies", "connections"],
    queryFn: getConnections,
  });
}

export function useBuddyFinder() {
  return useQuery({
    queryKey: ["buddies", "finder"],
    queryFn: getBuddyFinder,
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ["buddies", "invitations"],
    queryFn: getInvitations,
  });
}

// --- MUTATIONS (POST) ---

// 1. Send Request
export function useSendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, message }: { userId: number; message: string }) =>
      sendConnectionRequest(userId, message),
    onSuccess: () => {
      // Refresh the finder list to update status from "none" to "pending"
      queryClient.invalidateQueries({ queryKey: ["buddies", "finder"] });
      toast.success("Connection request sent!");
    },
    onError: () => {
      toast.error("Failed to send request.");
    },
  });
}

// 2. Accept Invitation
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => acceptInvitation(invitationId),
    onSuccess: () => {
      // 1. Remove from invitations list
      queryClient.invalidateQueries({ queryKey: ["buddies", "invitations"] });
      // 2. Add to connections list
      queryClient.invalidateQueries({ queryKey: ["buddies", "connections"] });
      // 3. Update finder status
      queryClient.invalidateQueries({ queryKey: ["buddies", "finder"] });

      toast.success("Connection accepted!");
    },
    onError: () => toast.error("Failed to accept connection."),
  });
}

// 3. Reject Invitation
export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => rejectInvitation(invitationId),
    onSuccess: () => {
      // Remove from invitations list
      queryClient.invalidateQueries({ queryKey: ["buddies", "invitations"] });
      toast.success("Request ignored.");
    },
    onError: () => toast.error("Failed to reject request."),
  });
}
