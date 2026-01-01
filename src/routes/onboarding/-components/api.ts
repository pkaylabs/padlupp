import { api } from "@/lib/api";

export interface OnboardingPayload {
  experience: string; // Mapped from 'goal'
  interests: string[];
  avatar: File | null;
}

export const setOnboardingExperience = async (data: OnboardingPayload) => {
  const formData = new FormData();

  // 1. Append simple text fields
  formData.append("experience", data.experience);

  // 2. Append Array (Interests)
  // Note: Check your backend!
  // Standard method: append 'interests' multiple times
  data.interests.forEach((interest) => {
    formData.append("interests", interest);
  });

  // 3. Append File if it exists
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  // Axios automatically sets 'Content-Type': 'multipart/form-data'
  // when it detects a FormData instance.
  const response = await api.post("/onboarding/set-experience/", formData);
  return response.data;
};
