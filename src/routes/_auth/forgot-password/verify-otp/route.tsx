import { ForgotPasswordVerifyOtp } from "@/pages/auth/forgot-password/verify-otp";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forgot-password/verify-otp")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative z-10 w-full">
      <ForgotPasswordVerifyOtp />
    </div>
  );
}
