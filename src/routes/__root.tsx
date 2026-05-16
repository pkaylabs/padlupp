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

// todos
// - add a small confirmation modal before member removal from a goal
// - remove that explicit “Voice note” option from the chat + modal.
// - I want us to implement a voice audio recorder in the chat at where the MIC icon is placed and the way those voice notes are sent is the same as the way media is sent.
