import { GoalDetailsPage } from "@/pages/app/goals/detials";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/goals/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GoalDetailsPage />;
}
