import { ForgotPasswordRequestOtp } from "@/pages/auth/forgot-password/request-otp";
import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="relative z-10 w-full">
      {pathname === "/forgot-password" ? <ForgotPasswordRequestOtp /> : <Outlet />}
    </div>
  );
}
