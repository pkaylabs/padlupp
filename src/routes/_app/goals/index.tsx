import { GoalsPage } from "@/pages/app/goals";
import { resolvePostAuthRedirect } from "@/pages/auth/utils/redirect";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/goals/")({
  validateSearch: (search: Record<string, unknown>) => {
    const next: {
      shared_id?: string;
      goal_id?: string;
    } = {};

    if (typeof search.shared_id === "string") {
      next.shared_id = search.shared_id;
    }
    if (typeof search.goal_id === "string") {
      next.goal_id = search.goal_id;
    }

    return next;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!search.goal_id) return;
    const nextHref = resolvePostAuthRedirect(
      `/goals?goal_id=${encodeURIComponent(search.goal_id)}${
        search.shared_id
          ? `&shared_id=${encodeURIComponent(search.shared_id)}`
          : ""
      }`,
    );
    void navigate({ href: nextHref, replace: true });
  }, [navigate, search.goal_id, search.shared_id]);

  if (search.goal_id) {
    return null;
  }

  return <GoalsPage />;
}
