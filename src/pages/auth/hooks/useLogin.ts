import { useAuthStore } from "@/features/auth/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LoginCredentials, loginUser } from "../api";
import { DASHBOARD } from "@/constants/page-path";

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),

    onSuccess: (data: any) => {
      // 1. Update Zustand Store (Persists automatically)
      login(data.token, data.user);

      // 2. Invalidate Router to ensure guards re-run immediately
      router.invalidate();

      // 3. Navigate to Dashboard
      router.navigate({ to: DASHBOARD });

      // Optional: UX feedback
      // toast.success('Welcome back!');
    },

    onError: (error: any) => {
      // Handle errors globally for this action
      console.error("Login failed:", error);
      // toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}
