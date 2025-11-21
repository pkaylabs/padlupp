import { SettingsPage } from "@/pages/app/settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SettingsPage />;
}
