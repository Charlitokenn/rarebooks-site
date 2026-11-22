// The signing contract and the email key rule, shared with the control site (spec 0014 AC-6, AC-8, AC-9).
// Run with `npm test` (`node --test`, which strips the TypeScript types).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { emailKey } from "../../src/lib/onboarding/email-key.ts";
import { isFresh, isValidSignature, sign } from "../../src/lib/onboarding/signing.ts";

const here = new URL(".", import.meta.url);
const vectors = JSON.parse(readFileSync(new URL("signing_vectors.json", here), "utf8")).vectors as {
  name: string;
  secret: string;
  body: string;
  signature: string;
}[];
const emailCases = JSON.parse(readFileSync(new URL("email_key_cases.json", here), "utf8")) as [
  string,
  string,
][];

test("every golden vector signs to the same header as the Python sides", async () => {
  // covers: AC-8 (the third copy of signing_vectors.json)
  assert.ok(vectors.length > 0);
  for (const vector of vectors) {
    assert.equal(await sign(vector.body, vector.secret), vector.signature, vector.name);
    assert.ok(await isValidSignature(vector.body, vector.signature, vector.secret), vector.name);
  }
});

test("a wrong secret, body or header never verifies", async () => {
  // covers: AC-6, AC-8
  const [vector] = vectors;
  assert.equal(await isValidSignature(vector.body + " ", vector.signature, vector.secret), false);
  assert.equal(await isValidSignature(vector.body, vector.signature, "other"), false);
  assert.equal(await isValidSignature(vector.body, vector.signature.slice(0, -1), vector.secret), false);
  assert.equal(await isValidSignature(vector.body, null, vector.secret), false);
  assert.equal(await isValidSignature(vector.body, vector.signature, ""), false);
});

test("issued_at must carry a zone and be within 5 minutes", () => {
  // covers: AC-6
  const now = Date.parse("2026-11-22T10:00:00Z");
  assert.ok(isFresh("2026-11-22T10:04:59+00:00", now));
  assert.ok(isFresh("2026-11-22T13:00:00+03:00", now));
  assert.equal(isFresh("2026-11-22T10:06:00+00:00", now), false);
  assert.equal(isFresh("2026-11-22T10:00:00", now), false);
  assert.equal(isFresh("soon", now), false);
  assert.equal(isFresh(undefined, now), false);
});

test("emailKey matches the control site on the shared cases", () => {
  // covers: AC-9
  for (const [email, key] of emailCases) {
    assert.equal(emailKey(email), key, email);
  }
});
