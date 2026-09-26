import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const distDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const inspectedExtensions = new Set([".css", ".html", ".js"]);
const loopbackPattern = /(?:localhost|127\.0\.0\.1|\[::1\]):8000/i;

async function findLoopbackReferences(directory) {
  const matches = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      matches.push(...(await findLoopbackReferences(entryPath)));
    } else if (inspectedExtensions.has(extname(entry.name))) {
      const content = await readFile(entryPath, "utf8");
      if (loopbackPattern.test(content)) matches.push(entryPath);
    }
  }

  return matches;
}

const matches = await findLoopbackReferences(distDirectory);

if (matches.length > 0) {
  console.error("Production build contains loopback URLs:");
  for (const match of matches) console.error(`- ${match}`);
  process.exit(1);
}

console.log("Production build endpoint verification passed.");
