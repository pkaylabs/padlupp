import { useAuthStore } from "@/features/auth/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { RegisterCredentials, registerUser } from "../api";

export function useRegister() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => registerUser(credentials),

    onSuccess: (data) => {
      // 1. Auto-login the user immediately after registration
      // (Assumes API returns token. If not, remove this line)
      login(data.token, data.user);

      // 2. Invalidate router state
      router.invalidate();

      // 3. Navigate to Onboarding
      router.navigate({ to: "/onboarding" });
    },

    onError: (error: any) => {
      console.error("Registration failed:", error);
      // Optional: Display error toast
      // toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
}
