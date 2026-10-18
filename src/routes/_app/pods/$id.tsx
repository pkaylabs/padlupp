import { createFileRoute } from "@tanstack/react-router";
import { PodDetailsPage, type PodTab } from "@/pages/app/pods/details";

export const Route = createFileRoute("/_app/pods/$id")({
  validateSearch: (search: Record<string, unknown>): { tab?: PodTab; checkin?: number } => ({
    tab: typeof search.tab === "string" && ["details", "members", "media", "links", "files", "checkin"].includes(search.tab) ? search.tab as PodTab : undefined,
    checkin: Number.isSafeInteger(Number(search.checkin)) && Number(search.checkin) > 0 ? Number(search.checkin) : undefined,
  }),
  component: PodDetailsPage,
});
