import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { DASHBOARD } from "@/constants/page-path";
import { OnboardingPayload, setOnboardingAvatar } from "./api";

export function useOnboardingAvatar() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: OnboardingPayload) => setOnboardingAvatar(data),

    onSuccess: () => {
      // 1. Invalidate queries (like 'user-profile') if you have them
      router.invalidate();
      // 2. Navigate to Dashboard
      router.navigate({ to: DASHBOARD });
      //   toast.success('Profile setup complete!');
    },
    onError: (error: unknown) => {
      console.error("Onboarding failed:", error);
      //   toast.error('Failed to save profile. Please try again.');
    },
  });
}
