import { api } from "@/lib/api";

export interface OnboardingPayload {
  experience?: string;
  interests?: string[];
  avatar?: File | null;
}

export const setOnboardingExperience = async (data: OnboardingPayload) => {
  const payload = {
    experience: data.experience ?? "",
    interests: data.interests ?? [],
  };

  const response = await api.post("/onboarding/set-experience/", payload);
  return response.data;
};

export const setOnboardingAvatar = async (data: OnboardingPayload) => {
  const formData = new FormData();

  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  const response = await api.patch("/onboarding/user-avatar/", formData);
  return response.data;
};
