import { GoalsPage } from "@/pages/app/goals";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/goals/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GoalsPage />;
}
