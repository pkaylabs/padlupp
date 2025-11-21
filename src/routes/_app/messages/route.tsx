import { MessagesPage } from "@/pages/app/messages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/messages")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MessagesPage />;
}
