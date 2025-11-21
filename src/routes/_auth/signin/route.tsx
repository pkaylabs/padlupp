import { SignIn } from "@/pages/auth/signin";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative z-10 w-full">
      <SignIn />
    </div>
  );
}
