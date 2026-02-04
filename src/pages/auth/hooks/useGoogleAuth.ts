import { CredentialResponse } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/authStore";
import { googleAuthUser, GoogleAuthPayload } from "../api";
import { DASHBOARD } from "@/constants/page-path";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

export function useGoogleAuth() {
  const router = useRouter();
  const loginToStore = useAuthStore((state) => state.login);

  const backendMutation = useMutation({
    mutationFn: (payload: GoogleAuthPayload) => googleAuthUser(payload),
    onSuccess: ({ data, status }) => {
      loginToStore(data.token, data.user);
      router.invalidate();

      console.log(status, "status");

      if (status === 201) {
        router.navigate({ to: "/onboarding", replace: true });
        toast.success("Account created successfully!");
      } else {
        router.navigate({ to: DASHBOARD, replace: true });
        toast.success("Welcome back!");
      }
    },
    onError: (error: any) => {
      console.error("Google Backend Error:", error);
      toast.error(
        error.response?.data?.detail || "Google authentication failed",
      );
    },
  });

  const handleGoogleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("No credential received from Google");
      return;
    }

    try {
      const decoded: any = jwtDecode(response.credential);

      backendMutation.mutate({
        id_token: response.credential,
        name: decoded.name,
        phone: "",
      });
    } catch (err) {
      console.error("Token Decode Failed", err);
      toast.error("Failed to process Google Credential");
    }
  };

  return {
    handleGoogleSuccess,
    handleGoogleError: () => toast.error("Google Login Failed"),
    isPending: backendMutation.isPending,
  };
}
