import { api } from "@/lib/api";

export interface OnboardingPayload {
  experience?: string;
  interests?: any[];
  avatar?: File | null;
}

export const setOnboardingExperience = async (data: OnboardingPayload) => {
  const formData = new FormData();

  if (data.experience) {
    formData.append("experience", data.experience);
  }

  if (data.interests) {
    const cleanInterests = data.interests.flat(Infinity);

    cleanInterests.forEach((interest) => {
      if (typeof interest === "string" && interest.trim() !== "") {
        formData.append("interests", interest);
      }
    });
  }

  const response = await api.post("/onboarding/set-experience/", formData);
  return response.data;
};

export const setOnboardingAvatar = async (data: OnboardingPayload) => {
  const formData = new FormData();

  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  const response = await api.post("/onboarding/user-avatar/", formData);
  return response.data;
};
