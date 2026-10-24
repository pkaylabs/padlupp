import { useMutation } from "@tanstack/react-query";
import { OnboardingPayload, setOnboardingExperience } from "./api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";

export function useOnboarding() {
  return useMutation({
    mutationFn: (data: OnboardingPayload) => setOnboardingExperience(data),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to save your setup. Please try again."));
    },
  });
}
