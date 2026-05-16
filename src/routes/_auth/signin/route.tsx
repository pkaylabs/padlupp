import { useAuthStore } from "@/features/auth/authStore";
import { resolvePostAuthRedirect } from "@/pages/auth/utils/redirect";
import { SignIn } from "@/pages/auth/signin";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signin")({
  validateSearch: (search: Record<string, unknown>) => {
    const next: { redirect?: string } = {};
    if (typeof search.redirect === "string") {
      next.redirect = search.redirect;
    }
    return next;
  },
  component: RouteComponent,
  beforeLoad: ({ search }) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      const href = resolvePostAuthRedirect(search.redirect);
      throw redirect({
        href,
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
