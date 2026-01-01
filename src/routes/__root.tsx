import { AuthState } from "@/features/auth/authStore";
import { createRootRoute, createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface RouterContext {
  auth: AuthState;
}

const RootLayout = () => (
  <div>
    <Outlet />
    {/* <TanStackRouterDevtools /> */}
  </div>
);

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout });
