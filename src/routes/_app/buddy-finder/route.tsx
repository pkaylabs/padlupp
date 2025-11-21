import { BuddyFinderPage } from "@/pages/app/buddy-finder";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/buddy-finder")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BuddyFinderPage />;
}
