import { useAuthStore } from "@/features/auth/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { RegisterCredentials, registerUser } from "../api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";

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

    onError: (error: unknown) => {
      console.error("Login failed:", error);
      toast.error(getApiErrorMessage(error, "Registration failed"));
    },
  });
}
