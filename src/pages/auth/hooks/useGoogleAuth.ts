import { CredentialResponse } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/authStore";
import { googleAuthUser, GoogleAuthPayload } from "../api";
import { resolvePostAuthRedirect } from "../utils/redirect";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { sanitizeNameInput } from "@/utils/name-validation";
import { getApiErrorMessage } from "@/utils/api-error";

export function useGoogleAuth(referralToken?: string) {
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
        const rawRedirect =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        const href = resolvePostAuthRedirect(rawRedirect);
        router.navigate({ href, replace: true });
        toast.success("Welcome back!");
      }
    },
    onError: (error: unknown) => {
      console.error("Google Backend Error:", error);
      toast.error(getApiErrorMessage(error, "Google authentication failed"));
    },
  });

  const handleGoogleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("No credential received from Google");
      return;
    }

    try {
      const decoded = jwtDecode<{ name?: unknown }>(response.credential);
      const sanitizedName = sanitizeNameInput(
        String(decoded.name || ""),
      ).trim();
      if (!sanitizedName) {
        toast.error("Invalid name from Google account");
        return;
      }

      backendMutation.mutate({
        id_token: response.credential,
        name: sanitizedName,
        phone: "",
        ...(referralToken ? { referral_token: referralToken } : {}),
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
