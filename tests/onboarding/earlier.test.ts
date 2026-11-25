// When the Worker trusts, drops or can't judge its D1 row for a user (spec 0016 AC-8, AC-9).
// Run with `npm test` (`node --test`, which strips the TypeScript types).

import assert from "node:assert/strict";
import { test } from "node:test";

import { earlierSignup } from "../../src/lib/onboarding/earlier.ts";

test("a signed 404 proves the row stale", () => {
  // covers: AC-8, AC-9
  assert.equal(earlierSignup({ status: 404, body: { issued_at: "x" } }, "BS-0001"), "stale");
});

test("a 200 for the row's own request keeps it", () => {
  // covers: AC-9
  assert.equal(
    earlierSignup({ status: 200, body: { request_id: "BS-0001", status: "Ready" } }, "BS-0001"),
    "live",
  );
});

test("a 200 naming another request is not proof either way", () => {
  // covers: AC-9
  assert.equal(earlierSignup({ status: 200, body: { request_id: "BS-0002" } }, "BS-0001"), "unknown");
  assert.equal(earlierSignup({ status: 200, body: {} }, "BS-0001"), "unknown");
});

test("no answer, a 401, 429 or 5xx never drops the row", () => {
  // covers: AC-8, AC-9
  assert.equal(earlierSignup(null, "BS-0001"), "unknown");
  for (const status of [401, 403, 429, 500, 502, 503]) {
    assert.equal(earlierSignup({ status, body: {} }, "BS-0001"), "unknown", String(status));
  }
});
