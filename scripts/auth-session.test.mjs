import assert from "node:assert/strict";
import { test } from "node:test";
import { isCurrentAuthRequest } from "../src/utils/auth-session.ts";

const current = { token: "current-token", sessionId: "current-login" };

test("an unauthorized response can end the session that sent it", () => {
  assert.equal(
    isCurrentAuthRequest("Token current-token", "current-login", current),
    true,
  );
});

test("a previous account's failed request cannot log out the current account", () => {
  assert.equal(
    isCurrentAuthRequest("Token old-token", "old-login", current),
    false,
  );
});

test("reusing a token in a new login does not authorize an older session's response", () => {
  assert.equal(
    isCurrentAuthRequest("Token current-token", "old-login", current),
    false,
  );
});

test("public, untracked and logged-out requests cannot clear a new login", () => {
  assert.equal(
    isCurrentAuthRequest(undefined, "current-login", current),
    false,
  );
  assert.equal(
    isCurrentAuthRequest("Token current-token", undefined, current),
    false,
  );
  assert.equal(
    isCurrentAuthRequest("Token old-token", "old-login", {
      token: null,
      sessionId: null,
    }),
    false,
  );
});

test("persisted legacy sessions without a session ID still reject their own expired token", () => {
  assert.equal(
    isCurrentAuthRequest("Token legacy-token", null, {
      token: "legacy-token",
      sessionId: null,
    }),
    true,
  );
  assert.equal(
    isCurrentAuthRequest("Token legacy-token", null, current),
    false,
  );
});
