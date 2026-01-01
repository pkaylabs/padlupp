import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { DASHBOARD } from "@/constants/page-path";
import { OnboardingPayload, setOnboardingExperience } from "./api";

export function useOnboarding() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: OnboardingPayload) => setOnboardingExperience(data),

    onSuccess: () => {
      // 1. Invalidate queries (like 'user-profile') if you have them
      router.invalidate();

      // 2. Navigate to Dashboard
      router.navigate({ to: DASHBOARD });

      //   toast.success('Profile setup complete!');
    },
    onError: (error: any) => {
      console.error("Onboarding failed:", error);
      //   toast.error('Failed to save profile. Please try again.');
    },
  });
}
