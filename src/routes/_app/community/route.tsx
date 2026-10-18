import { createFileRoute } from "@tanstack/react-router";
import { CommunityPage, type CommunitySearch } from "@/pages/app/community";

export const Route = createFileRoute("/_app/community")({
  validateSearch: (search: Record<string, unknown>): CommunitySearch => ({
    group: Number(search.group) > 0 && Number.isInteger(Number(search.group)) ? Number(search.group) : undefined,
    view: ["chat", "details", "settings", "hq"].includes(String(search.view)) ? search.view as CommunitySearch["view"] : "chat",
    invite: typeof search.invite === "string" ? search.invite : undefined,
    pod_invite: typeof search.pod_invite === "string" ? search.pod_invite : undefined,
    tab: ["members", "media", "pins", "links", "files", "tasks"].includes(String(search.tab)) ? search.tab as CommunitySearch["tab"] : undefined,
    setup: search.setup === true || search.setup === "true" ? true : undefined,
    create: search.create === true || search.create === "true" ? true : undefined,
    section: typeof search.section === "string" && ["Rules & Guidelines", "Post Permissions", "Approval Requests", "Moderation Log", "Report Queue", "Moderators", "Members", "Muted Users", "Banned Users"].includes(search.section) ? search.section : undefined,
  }),
  component: CommunityPage,
});
