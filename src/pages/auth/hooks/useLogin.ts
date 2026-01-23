import { useAuthStore } from "@/features/auth/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LoginCredentials, loginUser } from "../api";
import { DASHBOARD } from "@/constants/page-path";
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),

    onSuccess: (data: any) => {
      login(data.token, data.user);

      router.invalidate();

      router.navigate({ to: DASHBOARD, replace: true });

      toast.success("Welcome back!");
    },

    onError: (error: any) => {
      // Handle errors globally for this action
      console.error("Login failed:", error);
      toast.error(error.response?.data?.detail || "Login failed");
    },
  });
}
