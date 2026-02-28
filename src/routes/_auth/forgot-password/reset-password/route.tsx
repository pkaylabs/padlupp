import { ForgotPasswordResetPassword } from "@/pages/auth/forgot-password/reset-password";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forgot-password/reset-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative z-10 w-full">
      <ForgotPasswordResetPassword />
    </div>
  );
}
