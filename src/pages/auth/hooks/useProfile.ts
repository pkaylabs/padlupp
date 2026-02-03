import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateExperience,
  updateUserAccount,
  updateExtendedProfile,
  UpdateExperiencePayload,
  UpdateUserPayload,
  UpdateProfilePayload,
} from "../api/profile";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/authStore";

// --- QUERIES ---

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    // Don't refetch on window focus if data is fresh (optional config)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// --- MUTATIONS ---

// 1. Update Experience/Interests
export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateExperiencePayload) => updateExperience(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Interests updated successfully");
    },
    onError: () => toast.error("Failed to update experience"),
  });
}

// 2. Update Basic User Info (Name, Phone)
export function useUpdateUserAccount() {
  const queryClient = useQueryClient();
  // We might also need to update the Auth Store if the user's name changes there
  const setAuthUser = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUserAccount(payload),
    onSuccess: (updatedUser) => {
      // 1. Refresh Profile Query
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      // 2. Update Global Auth Store (so sidebar name updates immediately)
      if (token) {
        setAuthUser(token, updatedUser);
      }

      toast.success("Account details saved");
    },
    onError: () => toast.error("Failed to update account details"),
  });
}

// 3. Update Extended Profile (Bio, Location)
export function useUpdateExtendedProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      updateExtendedProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });
}
