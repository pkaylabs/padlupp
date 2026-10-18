import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/pods")({
	validateSearch: (search: Record<string, unknown>): { invitation?: number } => ({ invitation: Number.isSafeInteger(Number(search.invitation)) && Number(search.invitation) > 0 ? Number(search.invitation) : undefined }),
	component: Outlet,
});
