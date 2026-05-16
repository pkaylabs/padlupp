import { GoalPreviewPage } from "@/pages/public/goal-preview";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/goals/$id/preview")({
  validateSearch: (search: Record<string, unknown>) => {
    const next: { shared_id?: string } = {};
    if (typeof search.shared_id === "string") {
      next.shared_id = search.shared_id;
    }
    return next;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  return <GoalPreviewPage goalId={id} sharedId={search.shared_id} />;
}
