import { MilestonesPage } from "@/pages/app/dashboard/milestones-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/milestones")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MilestonesPage />;
}
