import { SignUp } from "@/pages/auth/signup";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative z-10 w-full">
      <SignUp />
    </div>
  );
}
