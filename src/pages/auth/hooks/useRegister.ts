import { useAuthStore } from "@/features/auth/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { RegisterCredentials, registerUser } from "../api";
import { toast } from "sonner";

export function useRegister() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => registerUser(credentials),

    onSuccess: (data) => {
      login(data.token, data.user);

      router.invalidate();

      router.navigate({ to: "/onboarding" });
    },

    onError: (error: any) => {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.detail || "Login failed");
    },
  });
}
