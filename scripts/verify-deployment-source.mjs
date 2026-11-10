import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = fileURLToPath(new URL("../", import.meta.url));
const sourceFile = new URL("../deployment-source.json", import.meta.url);

function git(args) {
  return execFileSync("git", args, {
    cwd: repositoryDirectory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function verifyDeploymentSource({
  source = JSON.parse(readFileSync(sourceFile, "utf8")),
  runGit = git,
} = {}) {
  if (!/^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/.test(source.remote ?? "") ||
      !/^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/.test(source.branch ?? "") ||
      typeof source.repository !== "string" || !source.repository) {
    throw new Error("Invalid deployment-source.json configuration.");
  }
  if (runGit(["status", "--porcelain"])) {
    throw new Error("Release builds require a clean Git working tree.");
  }
  if (runGit(["branch", "--show-current"]) !== source.branch) {
    throw new Error(`Release builds require the ${source.branch} branch.`);
  }
  if (runGit(["remote", "get-url", source.remote]) !== source.repository) {
    throw new Error(`The ${source.remote} remote must point to ${source.repository}.`);
  }

  const ref = `refs/remotes/${source.remote}/${source.branch}`;
  runGit(["fetch", "--no-tags", source.remote, `refs/heads/${source.branch}:${ref}`]);
  const commit = runGit(["rev-parse", "HEAD"]);
  if (commit !== runGit(["rev-parse", ref])) {
    throw new Error(`HEAD must match the latest ${source.remote}/${source.branch} before release.`);
  }
  return { ...source, commit };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const source = verifyDeploymentSource();
    console.log(`Release source verified: ${source.repository} (${source.remote}/${source.branch}, ${source.commit}).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
