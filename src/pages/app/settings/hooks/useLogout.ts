import { useAuthStore } from "@/features/auth/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutAction = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      // await api.post('/auth/logout');

      return Promise.resolve();
    },
    onSuccess: () => {
      logoutAction();
      queryClient.clear();
      router.navigate({ to: "/signin", replace: true });

      toast.success("Logged out successfully");
    },
    onError: (error) => {
      console.error("Logout failed", error);
      logoutAction();
      router.navigate({ to: "/signin" });
    },
  });
}
