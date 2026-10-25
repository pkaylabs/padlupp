import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false } });
after(() => server.close());
const { GroupInvitations } = await server.ssrLoadModule("/src/pages/app/community/invitations.tsx");
const { GroupSettings } = await server.ssrLoadModule("/src/pages/app/community/details.tsx");
const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { location: { origin: "https://padlupp.example" } },
});
after(() => {
  if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
  else delete globalThis.window;
});

const group = {
  id: 17, name: "Community", description: "Group description", category: { id: 1, name: "Learning" },
  can_manage: true, rules: [], post_permissions: {}, creator: { name: "Creator" },
  created_at: "2026-10-25T12:00:00Z",
};
const context = { categories: [], is_internal: false };
const queryKey = ["community", "invitations", group.id];
const invitation = {
  id: 91, user: { id: 8, name: "Morgan", avatar: null }, invited_by: { id: 9, name: "Inviter", avatar: null },
  role: "moderator", status: "pending", created_at: "2026-10-25T12:00:00Z",
  expires_at: "2026-11-01T12:00:00Z", is_link: false, url: null,
};
const page = (results, next = null) => ({ results, count: results.length, next, previous: null });

function render(Component, props, { pages, error, fetching = false } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, retryOnMount: false, staleTime: Infinity } } });
  try {
    if (pages) client.setQueryData(queryKey, { pages, pageParams: pages.map((_, i) => i + 1) });
    if (error || fetching) {
      const query = client.getQueryCache().build(client, { queryKey });
      query.setState(error ? { status: "error", error, fetchStatus: "idle" } : { fetchStatus: "fetching" });
    }
    return renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(Component, props)));
  } finally {
    client.clear();
  }
}

test("Settings > People exposes invitations only through can_manage, including internal managers", () => {
  const props = { group, context, onBack() {}, onTab() {} };
  const admin = render(GroupSettings, props);
  assert.match(admin, /<h2>People<\/h2>[\s\S]*<span>Invitations<\/span>/);
  assert.doesNotMatch(render(GroupSettings, { ...props, group: { ...group, can_manage: false } }), /<span>Invitations<\/span>/);
  assert.match(render(GroupSettings, { ...props, context: { ...context, is_internal: true } }), /<span>Invitations<\/span>/);
});

test("a direct invitations section cannot expose manager UI to a non-manager", () => {
  const html = render(GroupSettings, {
    group: { ...group, can_manage: false }, context, onBack() {}, onTab() {}, initialSection: "Invitations",
  }, { pages: [page([invitation])] });
  assert.match(html, /This page is not available/);
  assert.doesNotMatch(html, /Morgan|Revoke invitation|No pending invitations/);
  assert.equal(render(GroupInvitations, { group: { ...group, can_manage: false } }), "");
});

test("renders actual invitee, role, inviter and expiry without fabricating a personal URL", () => {
  const html = render(GroupInvitations, { group }, { pages: [page([{ ...invitation, url: "https://should-not-be-shared.example" }])] });
  assert.match(html, /Morgan/);
  assert.match(html, /Role: moderator/);
  assert.match(html, /Invited by Inviter/);
  assert.match(html, /dateTime="2026-11-01T12:00:00Z"/);
  assert.match(html, /Revoke invitation/);
  assert.doesNotMatch(html, /should-not-be-shared/);
});

test("generic invite links use the actual backend URL and tolerate a missing inviter", () => {
  const link = { ...invitation, id: 92, user: null, invited_by: null, is_link: true, url: "https://padlupp.example/community?invite=actual-token&group=17" };
  const html = render(GroupInvitations, { group }, { pages: [page([link])] });
  assert.match(html, /<strong>Invite link<\/strong>/);
  assert.match(html, /Generic invitation, not tied to a specific person/);
  assert.match(html, /href="https:\/\/padlupp.example\/community\?invite=actual-token&amp;group=17"/);
  assert.doesNotMatch(html, /Unavailable invitee|Invited by/);
});

test("unavailable personal invitees are not mislabeled as generic links", () => {
  const html = render(GroupInvitations, { group }, { pages: [page([{ ...invitation, user: null }])] });
  assert.match(html, /Unavailable invitee/);
  assert.doesNotMatch(html, /Generic invitation|<strong>Invite link/);
});

test("renders paginated server order and a load-more control only with a next page", () => {
  const first = page([invitation], "https://api.padlupp.example/community/groups/17/invitations/?page=2");
  const html = render(GroupInvitations, { group }, { pages: [first] });
  assert.match(html, /Load more invitations/);
  const fetching = render(GroupInvitations, { group }, { pages: [first], fetching: true });
  assert.match(fetching, /class="co-load-more" disabled=""/);
  const second = page([{ ...invitation, id: 90, user: { ...invitation.user, name: "Casey" } }]);
  const complete = render(GroupInvitations, { group }, { pages: [first, second] });
  assert.ok(complete.indexOf("Morgan") < complete.indexOf("Casey"));
  assert.doesNotMatch(complete, /Load more invitations/);
});

test("renders loading, empty and retryable errors without fake invitations", () => {
  const loading = render(GroupInvitations, { group });
  assert.match(loading, /Loading\.\.\./);
  assert.doesNotMatch(loading, /Revoke invitation/);
  const empty = render(GroupInvitations, { group }, { pages: [page([])] });
  assert.match(empty, /No pending invitations/);
  assert.doesNotMatch(empty, /Revoke invitation/);
  const failed = render(GroupInvitations, { group }, { error: new Error("Invitations unavailable") });
  assert.match(failed, /role="alert"/);
  assert.match(failed, /Invitations unavailable/);
  assert.match(failed, /Try again/);
  assert.doesNotMatch(failed, /Revoke invitation/);
});
