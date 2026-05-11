import { GoalPreviewPage } from "@/pages/public/goal-preview";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/goals/$id/preview")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <GoalPreviewPage goalId={id} />;
}