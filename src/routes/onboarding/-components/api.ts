import { api } from "@/lib/api";
import type { User, UserProfile } from "@/pages/auth/api/profile";

export interface OnboardingPayload {
  experience?: string;
  interests?: string[];
  bio?: string;
  avatar?: File | null;
}

export const setOnboardingExperience = async (data: OnboardingPayload) => {
  const payload: Omit<OnboardingPayload, "avatar"> = {};
  if (data.experience !== undefined) payload.experience = data.experience;
  if (data.interests !== undefined) payload.interests = data.interests;
  if (data.bio !== undefined) payload.bio = data.bio.trim();

  const response = await api.post<UserProfile>("/onboarding/set-experience/", payload);
  return response.data;
};

export const completeOnboarding = async () => {
  const { data } = await api.post<{ user: User; profile: UserProfile }>(
    "/onboarding/complete/",
  );
  return data;
};

export const setOnboardingAvatar = async (data: OnboardingPayload) => {
  const formData = new FormData();

  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  const response = await api.patch("/onboarding/user-avatar/", formData);
  return response.data;
};
