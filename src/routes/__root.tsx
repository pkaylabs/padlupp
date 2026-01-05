import { AuthState } from "@/features/auth/authStore";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

interface RouterContext {
  auth: AuthState;
}

const RootLayout = () => (
  <div>
    <Outlet />
    <Toaster expand position="top-right" richColors closeButton />
    {/* <TanStackRouterDevtools /> */}
  </div>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
