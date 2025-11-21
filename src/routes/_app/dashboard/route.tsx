import { DashboardComponent } from "@/pages/app/dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardComponent />;
}
