import { GoalInvitePage } from "@/pages/public/goal-invite";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/goal-invite/$token")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useParams();
  return <GoalInvitePage token={token} />;
}
