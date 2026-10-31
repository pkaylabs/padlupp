import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false } });
after(() => server.close());
const { PaddiePodsPage } = await server.ssrLoadModule("/src/pages/app/pods/index.tsx");
const { PodDetailsPage } = await server.ssrLoadModule("/src/pages/app/pods/details.tsx");

const goal = {
  id: 42, title: "Read 5 Pages a Day", description: "Read together",
  user: { id: 1, name: "Creator" }, conversation_id: 73,
  is_shared: true, is_active: true, can_write: true, progress: 25,
  checkin_frequency: "DAILY", members: [],
};
const page = (results) => ({ results, next: null, previous: null, count: results.length });

async function render(url, pod = goal) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const root = createRootRoute({ component: Outlet });
  const app = createRoute({ getParentRoute: () => root, id: "_app", component: Outlet });
  const index = createRoute({ getParentRoute: () => app, path: "/pods/", component: PaddiePodsPage });
  const detail = createRoute({ getParentRoute: () => app, path: "/pods/$id", validateSearch: (search) => search, component: PodDetailsPage });
  const router = createRouter({ routeTree: root.addChildren([app.addChildren([index, detail])]), history: createMemoryHistory({ initialEntries: [url] }), isServer: true });
  client.setQueryData(["goal", String(pod.id)], pod);
  client.setQueryData(["goal-members", String(pod.id)], []);
  client.setQueryData(["goal-checkins", pod.id], []);
  client.setQueryData(["tasks", { goal: pod.id, ordering: "due_at" }], page([]));
  client.setQueryData(["goals", "pods"], { pages: [page([pod])], pageParams: [1] });
  client.setQueryData(["community", "task-invitations"], { pages: [page([])], pageParams: [1] });
  client.setQueryData(["community", "messages", pod.conversation_id, ""], { pages: [page([])], pageParams: [1] });
  try {
    await router.load();
    return renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(RouterProvider, { router })));
  } finally {
    client.clear();
  }
}

test("pod cards have one full-width Open Pod link and no separate chat icon", async () => {
  const html = await render("/pods");
  assert.match(html, /<a class="[^"]*w-full[^"]*" href="\/pods\/42">Open Pod<\/a>/);
  assert.equal((html.match(/>Open Pod<\/a>/g) || []).length, 1);
  assert.doesNotMatch(html, /Open Read 5 Pages a Day messages|href="\/messages/);
});

test("opening a pod without a tab opens its conversation and composer", async () => {
  const html = await render("/pods/42");
  assert.match(html, /class="pod-details-pane pod-show-chat"/);
  assert.match(html, /aria-label="Conversation"/);
  assert.match(html, /Welcome to Read 5 Pages a Day/);
  assert.match(html, /<textarea[^>]*placeholder="Type a message"/);
  assert.match(html, /aria-label="Open task details"/);
  assert.match(html, /class="pod-tab-content" hidden=""/);
});

test("explicit details links still open task details rather than chat", async () => {
  const html = await render("/pods/42?tab=details");
  assert.match(html, /class="pod-details-pane"/);
  assert.match(html, /aria-label="Open pod messages"/);
  assert.match(html, /Milestones/);
  assert.doesNotMatch(html, /aria-label="Conversation"|class="pod-tab-content" hidden/);
});

test("explicit check-in links keep the check-in panel visible", async () => {
  const html = await render("/pods/42?tab=checkin");
  assert.match(html, /class="pod-details-pane"/);
  assert.match(html, /aria-label="Pod check-in history"/);
  assert.doesNotMatch(html, /aria-label="Conversation"|class="pod-tab-content" hidden/);
});

test("a pod without a conversation shows a clear status instead of a blank chat", async () => {
  const html = await render("/pods/42", { ...goal, conversation_id: null });
  assert.match(html, /Pod chat is unavailable/);
  assert.match(html, /aria-label="Open task details"/);
});
