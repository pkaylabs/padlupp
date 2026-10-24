import assert from "node:assert/strict";
import { test } from "node:test";
import { fromDatetimeLocal, toDatetimeLocal } from "../src/utils/datetime.ts";

function inTimezone(zone, run) {
  const previous = process.env.TZ;
  process.env.TZ = zone;
  try {
    run();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}

test("round-trips UTC deadlines and clears optional dates", () =>
  inTimezone("UTC", () => {
    assert.equal(
      toDatetimeLocal("2026-10-24T15:30:45.123Z"),
      "2026-10-24T15:30",
    );
    assert.equal(
      fromDatetimeLocal("2026-10-24T16:40"),
      "2026-10-24T16:40:00.000Z",
    );
    assert.equal(fromDatetimeLocal(""), null);
    assert.equal(toDatetimeLocal(null), "");
    assert.equal(toDatetimeLocal("not a date"), "");
  }));

test("shows and submits the user's local time rather than slicing UTC", () =>
  inTimezone("Asia/Kolkata", () => {
    assert.equal(toDatetimeLocal("2026-10-24T15:30:00Z"), "2026-10-24T21:00");
    assert.equal(
      fromDatetimeLocal("2026-10-24T21:00"),
      "2026-10-24T15:30:00.000Z",
    );
  }));

test("uses the selected date's daylight-saving offset", () =>
  inTimezone("America/New_York", () => {
    assert.equal(
      fromDatetimeLocal("2026-07-01T09:00"),
      "2026-07-01T13:00:00.000Z",
    );
    assert.equal(
      fromDatetimeLocal("2026-12-01T09:00"),
      "2026-12-01T14:00:00.000Z",
    );
    assert.throws(
      () => fromDatetimeLocal("2026-03-08T02:30"),
      /valid local date/,
    );
  }));

test("rejects malformed and impossible dates", () =>
  inTimezone("UTC", () => {
    for (const value of [
      "not a date",
      "2026-02-30T09:00",
      "2026-10-24T25:00",
      "2026-10-24",
    ]) {
      assert.throws(() => fromDatetimeLocal(value), /valid local date/);
    }
  }));
