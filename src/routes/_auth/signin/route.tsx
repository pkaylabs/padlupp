import { DASHBOARD } from "@/constants/page-path";
import { useAuthStore } from "@/features/auth/authStore";
import { SignIn } from "@/pages/auth/signin";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signin")({
  component: RouteComponent,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({
        to: DASHBOARD,
      });
    }
  },
});

function RouteComponent() {
  return (
    <div className="relative z-10 w-full">
      <SignIn />
    </div>
  );
}
