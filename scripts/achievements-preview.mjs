import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function startAchievementsPreview(port = 4175) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Achievements local preview</title></head><body><div id="root"></div><script type="module" src="/scripts/achievements-preview-entry.tsx"></script></body></html>`;
  const server = await createServer({
    configFile: false, root, appType: "mpa", plugins: [react(), tailwindcss(), {
      name: "achievements-test-preview",
      configureServer(vite) {
        vite.middlewares.use(async (request, response, next) => {
          if (request.url?.split("?")[0] !== "/") return next();
          response.setHeader("Content-Type", "text/html");
          response.end(await vite.transformIndexHtml("/", html));
        });
      },
    }],
    resolve: { alias: { "@": fileURLToPath(new URL("../src/", import.meta.url)) } },
    server: { host: "127.0.0.1", port, strictPort: true, open: false },
  });
  await server.listen();
  return server;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const server = await startAchievementsPreview(Number(process.argv[2] || 4175));
  server.printUrls();
  console.log("Test fixtures only; all achievement API calls use an in-memory adapter. Ctrl+C to stop.");
}
