import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterContextProvider } from "@tanstack/react-router";
import { createServer } from "vite";

const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
const server = await createServer({ server: { middlewareMode: true, hmr: false }, ssr: { noExternal: ["react-use"] } });
after(async () => {
  await server.close();
  if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
  else delete globalThis.window;
});
const { AppNavigation } = await server.ssrLoadModule("/src/routes/_app/-components/app-navigation.tsx");
const { TopNav } = await server.ssrLoadModule("/src/routes/_app/-components/top-nav.tsx");
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: { getItem: () => "dark" }, location: { origin: "http://127.0.0.1:8080" },
    addEventListener() {}, removeEventListener() {},
  },
});

async function render(url, pods = [{ id: 42, title: "Reading pod" }]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const root = createRootRoute({ component: Outlet });
  const app = createRoute({ getParentRoute: () => root, id: "_app", component: Outlet });
  const paths = ["/goals", "/community", "/pods", "/pods/$id", "/messages", "/buddy-finder", "/settings"];
  const routes = paths.map((path) => createRoute({ getParentRoute: () => app, path, component: () => createElement("p", null, "Page content") }));
  const router = createRouter({ routeTree: root.addChildren([app.addChildren(routes)]), history: createMemoryHistory({ initialEntries: [url] }), isServer: true });
  client.setQueryData(["goals", "pods"], { pages: [{ results: pods, next: null }], pageParams: [1] });
  try {
    await router.load();
    return renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(RouterContextProvider, { router },
      createElement(Fragment, null, createElement(AppNavigation), createElement(TopNav)))));
  } finally {
    client.clear();
  }
}

for (const path of ["/goals", "/community", "/pods", "/pods/42", "/messages", "/buddy-finder", "/settings"]) {
  test(`${path} retains the full icon-based navigation and working account controls`, async () => {
    const html = await render(path);
    assert.match(html, /aria-label="Main navigation"/);
    assert.match(html, /<button[^>]*aria-expanded="false"[^>]*>[\s\S]*?Your Groups/);
    assert.match(html, /aria-label="(?:Expand|Collapse) Paddie Pods"/);
    for (const destination of ["goals", "messages", "buddy-finder", "community", "settings"]) {
      const link = html.match(new RegExp(`<a[^>]*href="/${destination}"[^>]*>([\\s\\S]*?)</a>`));
      assert.ok(link, `${destination} link is present`);
      assert.match(link[1], /<svg/, `${destination} retains its icon`);
    }
    assert.match(html, /aria-label="Account navigation"/);
    assert.equal((html.match(/aria-label="Notifications"/g) || []).length, 1);
    assert.equal((html.match(/aria-label="Set timer"/g) || []).length, 1);
  });
}

test("pod detail routes expand the actual pod list and mark the selected pod", async () => {
  const html = await render("/pods/42");
  assert.match(html, /aria-label="Collapse Paddie Pods" aria-expanded="true"/);
  assert.match(html, /aria-label="Paddie Pods"/);
  assert.match(html, /href="\/pods\/42"[^>]*data-status="active"/);
  assert.match(html, /Reading pod/);
});

test("the Paddie Pods index retains its blue active row and expandable list", async () => {
  const html = await render("/pods");
  assert.match(html, /<div class="bg-primary-500[^\"]*"><a[^>]*href="\/pods"/);
  assert.match(html, /aria-label="Expand Paddie Pods" aria-expanded="false"/);
});

test("an expanded pod menu has an honest empty state", async () => {
  const html = await render("/pods/42", []);
  assert.match(html, /No pods yet/);
  assert.doesNotMatch(html, /Reading pod/);
});
