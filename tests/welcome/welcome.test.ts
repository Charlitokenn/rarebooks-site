// The /welcome page after sign up (spec 0023): the old /dashboard map, the protected route, the prefetch
// guard, the checklist mapping and the address rule. Run with `npm test` (`node --test`).

import assert from "node:assert/strict";
import { test } from "node:test";

import { welcomeDocs } from "../../src/constants/welcome.ts";
import { publicAddress } from "../../src/lib/onboarding/address.ts";
import { checklist, currentStep } from "../../src/lib/onboarding/checklist.ts";
import { isPrefetch } from "../../src/lib/onboarding/prefetch.ts";
import { LEGACY_REDIRECT_STATUS, WELCOME_ROUTE, legacyTarget } from "../../src/lib/redirects.ts";

test("each old /dashboard path maps to its /welcome route (AC-9)", () => {
  // covers: AC-9
  assert.equal(legacyTarget("/dashboard"), "/welcome");
  assert.equal(legacyTarget("/dashboard/"), "/welcome");
  assert.equal(legacyTarget("/dashboard/start"), "/welcome");
  assert.equal(legacyTarget("/dashboard/settings"), "/welcome");
  assert.equal(legacyTarget("/dashboard/site/open"), "/welcome/open");
  assert.equal(legacyTarget("/dashboard/site/open/"), "/welcome/open");
  assert.equal(legacyTarget("/dashboard/anything/else"), "/welcome");
});

test("only a whole, case sensitive /dashboard segment is matched (AC-9)", () => {
  // covers: AC-9
  assert.equal(legacyTarget("/dashboardx"), null);
  assert.equal(legacyTarget("/Dashboard"), null);
  assert.equal(legacyTarget("/basics/dashboard/"), null);
  assert.equal(legacyTarget("/welcome"), null);
  assert.equal(legacyTarget("/"), null);
});

test("the legacy redirect stays temporary until the switch to 301 (AC-9)", () => {
  // covers: AC-9 (build plan step 9 changes this to 301)
  assert.equal(LEGACY_REDIRECT_STATUS, 302);
});

test("the protected route is /welcome and below, never /welcomefoo (AC-1)", () => {
  // covers: AC-1
  for (const path of ["/welcome", "/welcome/", "/welcome/open", "/welcome/open/"]) {
    assert.ok(WELCOME_ROUTE.test(path), path);
  }
  for (const path of ["/welcomefoo", "/welcome-x", "/", "/dashboard", "/x/welcome"]) {
    assert.ok(!WELCOME_ROUTE.test(path), path);
  }
});

test("HEAD and prefetch headers count as a prefetch, a plain GET does not (AC-3, AC-4)", () => {
  // covers: AC-3, AC-4
  const url = "https://rarebooks.cc/welcome/open";
  assert.equal(isPrefetch(new Request(url)), false);
  assert.equal(isPrefetch(new Request(url, { method: "HEAD" })), true);
  assert.equal(isPrefetch(new Request(url, { headers: { "Sec-Purpose": "prefetch" } })), true);
  assert.equal(isPrefetch(new Request(url, { headers: { "Sec-Purpose": "prefetch;prerender" } })), true);
  assert.equal(isPrefetch(new Request(url, { headers: { Purpose: "Prefetch" } })), true);
  assert.equal(isPrefetch(new Request(url, { headers: { "Sec-Purpose": "other" } })), false);
});

test("the current step follows the status and step (AC-5)", () => {
  // covers: AC-5
  assert.equal(currentStep("Queued", null), 1);
  assert.equal(currentStep("Claiming", null), 1);
  assert.equal(currentStep("Preparing", "Owner"), 2);
  assert.equal(currentStep("Preparing", null), 2);
  assert.equal(currentStep("Preparing", "Something new"), 2);
  assert.equal(currentStep("Preparing", "Domain"), 3);
});

test("steps before the current one are done and after it wait, with one aria-current step (AC-5)", () => {
  // covers: AC-5
  assert.deepEqual(
    checklist("Preparing", "Owner").map((s) => [s.title, s.state, s.current]),
    [
      ["Request received", "Done", false],
      ["Getting your site", "Done", false],
      ["Making your account", "In progress", true],
      ["Setting up your address", "Waiting", false],
    ],
  );
  assert.deepEqual(
    checklist("Queued", null).map((s) => s.state),
    ["Done", "In progress", "Waiting", "Waiting"],
  );
});

test("a Failed sign up marks the step it stopped at as Failed (AC-7)", () => {
  // covers: AC-7
  const failedAt = (step: string | null) =>
    checklist("Failed", step).find((s) => s.state === "Failed")?.title;
  assert.equal(failedAt("Owner"), "Making your account");
  assert.equal(failedAt("Domain"), "Setting up your address");
  assert.equal(failedAt(null), "Getting your site");
  assert.deepEqual(
    checklist("Failed", "Domain").map((s) => s.state),
    ["Done", "Done", "Done", "Failed"],
  );
});

test("the address shows while the site is built and at Ready, never for Failed (AC-7, AC-8)", () => {
  // covers: AC-7, AC-8
  for (const status of ["Queued", "Claiming", "Preparing", "Ready"] as const) {
    assert.equal(publicAddress(status, "https://acme.rarebooks.cc"), "https://acme.rarebooks.cc", status);
  }
  assert.equal(publicAddress("Failed", "https://acme.rarebooks.cc"), null);
  assert.equal(publicAddress("Queued", undefined), null);
  assert.equal(publicAddress("Queued", 42), null);
});

test("the three getting started links are root docs paths (AC-5)", () => {
  // covers: AC-5 (Starlight serves the docs at the site root)
  assert.deepEqual(
    welcomeDocs.map((doc) => doc.href),
    [
      "/getting-started/getting-started-with-rarebooks/",
      "/getting-started/chart-of-accounts/",
      "/getting-started/setup-opening-balances/",
    ],
  );
});
