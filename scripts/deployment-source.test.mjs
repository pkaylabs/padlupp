import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { verifyDeploymentSource } from "./verify-deployment-source.mjs";

const source = JSON.parse(readFileSync(new URL("../deployment-source.json", import.meta.url), "utf8"));
const commit = "a".repeat(40);

function fixture(overrides = {}) {
  const calls = [];
  const responses = {
    "status --porcelain": "",
    "branch --show-current": "main",
    "remote get-url padlupp": "https://github.com/padlup001/padlupp.git",
    "fetch --no-tags padlupp refs/heads/main:refs/remotes/padlupp/main": "",
    "rev-parse HEAD": commit,
    "rev-parse refs/remotes/padlupp/main": commit,
    ...overrides,
  };
  return {
    calls,
    runGit(args) {
      const key = args.join(" ");
      calls.push(key);
      assert.ok(Object.hasOwn(responses, key), `Unexpected Git command: ${key}`);
      if (responses[key] instanceof Error) throw responses[key];
      return responses[key];
    },
  };
}

test("production source is the padlup001 repository, not the mirror", () => {
  assert.deepEqual(source, {
    remote: "padlupp",
    repository: "https://github.com/padlup001/padlupp.git",
    branch: "main",
  });
});

test("release verification fetches and pins the configured canonical remote", () => {
  const git = fixture();
  assert.deepEqual(verifyDeploymentSource({ source, runGit: git.runGit }), { ...source, commit });
  assert.ok(git.calls.includes("fetch --no-tags padlupp refs/heads/main:refs/remotes/padlupp/main"));
  assert.ok(git.calls.every((call) => !call.includes("origin")));
});

for (const status of [" M src/app.tsx", "?? secret.env"]) {
  test(`uncommitted or untracked files block a release: ${status}`, () => {
    const git = fixture({ "status --porcelain": status });
    assert.throws(() => verifyDeploymentSource({ source, runGit: git.runGit }), /clean Git working tree/);
    assert.equal(git.calls.length, 1);
  });
}

test("a different branch or detached checkout cannot release", () => {
  for (const branch of ["feature", ""]) {
    const git = fixture({ "branch --show-current": branch });
    assert.throws(() => verifyDeploymentSource({ source, runGit: git.runGit }), /require the main branch/);
  }
});

test("a remote pointing to the old repository blocks a release before fetching", () => {
  const git = fixture({ "remote get-url padlupp": "https://github.com/pkaylabs/padlupp.git" });
  assert.throws(() => verifyDeploymentSource({ source, runGit: git.runGit }), /must point to/);
  assert.ok(git.calls.every((call) => !call.startsWith("fetch")));
});

test("stale, ahead, or diverged local code cannot release", () => {
  const git = fixture({ "rev-parse refs/remotes/padlupp/main": "b".repeat(40) });
  assert.throws(() => verifyDeploymentSource({ source, runGit: git.runGit }), /HEAD must match the latest padlupp\/main/);
});

test("a fetch failure is not mistaken for verification of a cached ref", () => {
  const git = fixture({ "fetch --no-tags padlupp refs/heads/main:refs/remotes/padlupp/main": new Error("Fetch failed") });
  assert.throws(() => verifyDeploymentSource({ source, runGit: git.runGit }), /Fetch failed/);
  assert.ok(git.calls.every((call) => !call.startsWith("rev-parse")));
});

test("invalid source configuration cannot become Git options", () => {
  const git = fixture();
  for (const invalid of [{ ...source, remote: "--all" }, { ...source, branch: "--help" }]) {
    assert.throws(() => verifyDeploymentSource({ source: invalid, runGit: git.runGit }), /Invalid deployment-source/);
  }
  assert.equal(git.calls.length, 0);
});
