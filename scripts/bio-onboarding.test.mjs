import assert from "node:assert/strict";
import { test } from "node:test";
import {
  accessibleOnboardingStep,
  clearOnboardingDraft,
  onboardingStorageKey,
  parseInterests,
  readOnboardingDraft,
  saveOnboardingDraft,
} from "../src/routes/onboarding/-components/progress-storage.ts";

const savedFields = Object.freeze({
  goal: "Work",
  interests: Object.freeze(["Reading", "Coding"]),
  bio: "Building good habits with a buddy.",
});

function withLocalStorage(run) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(String(key)) ?? null,
    setItem: (key, value) => values.set(String(key), String(value)),
    removeItem: (key) => values.delete(String(key)),
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  try {
    run(storage);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
}

function draft(overrides = {}) {
  return { ...savedFields, version: 2, userId: 11, currentStep: 4, ...overrides };
}

test("unlocks the optional image step only after all required fields are saved", () => {
  assert.equal(accessibleOnboardingStep(savedFields, savedFields), 4);
  assert.equal(
    accessibleOnboardingStep({ ...savedFields, bio: "One sentence." }, { ...savedFields, bio: "One sentence." }),
    4,
  );
});

test("a missing or unsaved goal keeps later steps locked", () => {
  assert.equal(accessibleOnboardingStep(savedFields, { ...savedFields, goal: "" }), 1);
  assert.equal(accessibleOnboardingStep({ ...savedFields, goal: "   " }, savedFields), 1);
  assert.equal(accessibleOnboardingStep({ ...savedFields, goal: "School" }, savedFields), 1);
});

test("missing or unsaved interests keep bio and image steps locked", () => {
  assert.equal(accessibleOnboardingStep(savedFields, { ...savedFields, interests: [] }), 2);
  assert.equal(accessibleOnboardingStep({ ...savedFields, interests: [] }, savedFields), 2);
  assert.equal(accessibleOnboardingStep({ ...savedFields, interests: ["Reading"] }, savedFields), 2);
});

test("comparing interests ignores ordering without mutating either list", () => {
  const fields = Object.freeze({ ...savedFields, interests: Object.freeze(["Coding", "Reading"]) });
  assert.equal(accessibleOnboardingStep(fields, savedFields), 4);
  assert.deepEqual(fields.interests, ["Coding", "Reading"]);
  assert.deepEqual(savedFields.interests, ["Reading", "Coding"]);
});

test("blank and whitespace-only draft bios cannot unlock the image step", () => {
  for (const bio of ["", " ", "\t\n "]) {
    assert.equal(accessibleOnboardingStep({ ...savedFields, bio }, savedFields), 3);
  }
});

test("a nonblank draft bio is insufficient when the server bio is blank", () => {
  for (const bio of ["", " ", "\t\n "]) {
    assert.equal(accessibleOnboardingStep(savedFields, { ...savedFields, bio }), 3);
  }
});

test("unsaved bio edits must be saved again, while surrounding whitespace is harmless", () => {
  assert.equal(accessibleOnboardingStep({ ...savedFields, bio: "An unsaved update." }, savedFields), 3);
  assert.equal(accessibleOnboardingStep({ ...savedFields, bio: `  ${savedFields.bio}\n` }, savedFields), 4);
});

test("the first incomplete prerequisite wins even if later fields are populated", () => {
  assert.equal(accessibleOnboardingStep(savedFields, { goal: "", interests: [], bio: "" }), 1);
  assert.equal(accessibleOnboardingStep(savedFields, { ...savedFields, interests: [], bio: "" }), 2);
});

test("draft storage round-trips fields and preserves failed-step input", () => withLocalStorage(() => {
  const fields = { ...savedFields, bio: "  My unsaved bio draft.\n" };
  saveOnboardingDraft(11, fields, 3);
  assert.deepEqual(readOnboardingDraft(11), {
    ...fields, interests: [...fields.interests], version: 2, userId: 11, currentStep: 3,
  });
}));

test("drafts are isolated per account", () => withLocalStorage(() => {
  const other = { ...savedFields, bio: "A different account's draft." };
  saveOnboardingDraft(11, savedFields, 4);
  assert.equal(readOnboardingDraft(12), null);
  saveOnboardingDraft(12, other, 3);
  assert.equal(readOnboardingDraft(11).bio, savedFields.bio);
  assert.equal(readOnboardingDraft(12).bio, other.bio);
}));

test("a copied draft with another account's identity is rejected", () => withLocalStorage((storage) => {
  storage.setItem(onboardingStorageKey(12), JSON.stringify(draft()));
  assert.equal(readOnboardingDraft(12), null);
  storage.setItem(onboardingStorageKey(11), JSON.stringify(draft({ userId: "11" })));
  assert.equal(readOnboardingDraft(11), null);
}));

test("legacy unscoped progress is never imported into an account", () => withLocalStorage((storage) => {
  storage.setItem("onboarding-progress-v1", JSON.stringify(draft({ bio: "Another person's old draft." })));
  assert.equal(readOnboardingDraft(11), null);
}));

test("malformed JSON, unsupported schemas and invalid field types are rejected", () => withLocalStorage((storage) => {
  for (const value of [
    "not JSON", "null", "[]", "42",
    JSON.stringify(draft({ version: 1 })),
    JSON.stringify(draft({ goal: null })),
    JSON.stringify(draft({ bio: null })),
    JSON.stringify(draft({ interests: "Reading" })),
    JSON.stringify(draft({ interests: ["Reading", 42] })),
  ]) {
    storage.setItem(onboardingStorageKey(11), value);
    assert.equal(readOnboardingDraft(11), null, value);
  }
}));

test("stored step numbers are bounded and invalid step numbers fall back to goal", () => withLocalStorage((storage) => {
  for (const [stored, expected] of [[-5, 1], [0, 1], [1, 1], [4, 4], [99, 4], [2.5, 1], ["4", 1], [null, 1], [undefined, 1]]) {
    storage.setItem(onboardingStorageKey(11), JSON.stringify(draft({ currentStep: stored })));
    assert.equal(readOnboardingDraft(11).currentStep, expected);
  }
}));

test("resuming step four cannot bypass a missing server bio or another unsaved prerequisite", () => withLocalStorage(() => {
  saveOnboardingDraft(11, savedFields, 4);
  const restored = readOnboardingDraft(11);
  assert.equal(Math.min(restored.currentStep, accessibleOnboardingStep(restored, { ...savedFields, bio: "" })), 3);
  assert.equal(Math.min(restored.currentStep, accessibleOnboardingStep(restored, { ...savedFields, interests: [] })), 2);
  assert.equal(Math.min(restored.currentStep, accessibleOnboardingStep(restored, { ...savedFields, goal: "" })), 1);
}));

test("clearing one account's draft leaves other accounts and unrelated storage unchanged", () => withLocalStorage((storage) => {
  saveOnboardingDraft(11, savedFields, 4);
  saveOnboardingDraft(12, savedFields, 3);
  storage.setItem("unrelated", "keep");
  clearOnboardingDraft(11);
  assert.equal(readOnboardingDraft(11), null);
  assert.equal(readOnboardingDraft(12).currentStep, 3);
  assert.equal(storage.getItem("unrelated"), "keep");
}));

test("unavailable browser storage does not prevent server-backed onboarding", () => withLocalStorage((storage) => {
  storage.getItem = () => { throw new Error("Storage access denied"); };
  storage.setItem = () => { throw new Error("Storage quota exceeded"); };
  storage.removeItem = () => { throw new Error("Storage access denied"); };
  assert.equal(readOnboardingDraft(11), null);
  assert.doesNotThrow(() => saveOnboardingDraft(11, savedFields, 3));
  assert.doesNotThrow(() => clearOnboardingDraft(11));
}));

test("interests accept array and legacy comma-separated responses and discard invalid entries", () => {
  assert.deepEqual(parseInterests(" Reading, Coding , ,"), ["Reading", "Coding"]);
  assert.deepEqual(parseInterests([" Reading ", null, 42, "", "Coding"]), ["Reading", "Coding"]);
  for (const value of [undefined, null, 42, {}]) assert.deepEqual(parseInterests(value), []);
});

test("the localStorage mock is restored after each storage test", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  withLocalStorage((storage) => assert.equal(globalThis.localStorage, storage));
  assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, "localStorage"), original);
});
