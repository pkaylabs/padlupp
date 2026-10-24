import { useMutation } from "@tanstack/react-query";
import { OnboardingPayload, completeOnboarding, setOnboardingAvatar } from "./api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";

export function useOnboardingAvatar() {
  return useMutation({
    mutationFn: async (data: OnboardingPayload) => {
      if (data.avatar) await setOnboardingAvatar(data);
      return completeOnboarding();
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Could not finish setup. Please try again."));
    },
  });
}
