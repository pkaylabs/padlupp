import { DASHBOARD } from "@/constants/page-path";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  loader: () => {
    throw redirect({
      to: DASHBOARD,
    });
  },
});

function Index() {
  return (
    <div className="p-2 text-primary-50 font-monts">
      <h3>Welcome Home!</h3>
    </div>
  );
}
