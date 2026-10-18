import { MessagesPage } from "@/pages/app/messages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/messages")({
  validateSearch: (search: Record<string, unknown>): { conversation?: number } => {
    const id = Number(search.conversation);
    return { conversation: Number.isSafeInteger(id) && id > 0 ? id : undefined };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { conversation } = Route.useSearch();
  return <MessagesPage initialConversationId={conversation} />;
}
