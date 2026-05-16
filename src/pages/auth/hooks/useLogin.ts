import { useAuthStore } from "@/features/auth/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LoginCredentials, loginUser } from "../api";
import { resolvePostAuthRedirect } from "../utils/redirect";
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),

    onSuccess: (data: any) => {
      login(data.token, data.user);

      router.invalidate();

      const rawRedirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      const href = resolvePostAuthRedirect(rawRedirect);

      router.navigate({ href, replace: true });

      toast.success("Welcome back!");
    },

    onError: (error: any) => {
      // Handle errors globally for this action
      console.error("Login failed:", error);
      toast.error(error.response?.data?.detail || "Login failed");
    },
  });
}
