// Every docs URL, and each page's title, meta description and canonical link, stays the same (spec 0024 AC-10).
// The committed snapshot was written from the build before the restyle. Run `npm run build` first; with no
// build the comparison is skipped, with a message saying so.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { CLIENT_DIR, SNAPSHOT_FILE, docsHeadSnapshot, headOf } from "../../scripts/docs-head-snapshot.mjs";
import { AppConfig } from "../../src/constants/index.ts";

const built = existsSync(CLIENT_DIR);

test(
  "the built docs URLs, titles, descriptions and canonicals match the snapshot",
  { skip: built ? false : "no build in dist/client: run `npm run build` first" },
  () => {
    // covers: AC-10
    const expected = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8"));
    assert.deepEqual(docsHeadSnapshot(), expected);
  },
);

test("the snapshot holds the docs home", () => {
  // covers: AC-10
  const expected = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8"));
  assert.ok(expected[AppConfig.urls.docsHomePath], `${AppConfig.urls.docsHomePath} is not in the snapshot`);
  assert.ok(Object.keys(expected).length > 40);
});

test("headOf reads the title, description and canonical", () => {
  // covers: AC-10
  const html = `<html><head><title>A &amp; B | RareBooks</title>
    <meta name="description" content="Say &quot;hi&quot;">
    <link rel="canonical" href="https://rarebooks.cc/a/"></head></html>`;
  assert.deepEqual(headOf(html), {
    title: "A & B | RareBooks",
    description: 'Say "hi"',
    canonical: "https://rarebooks.cc/a/",
  });
});

test("a changed title fails the comparison", () => {
  // covers: AC-10
  const expected = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8"));
  const changed = structuredClone(expected);
  changed[AppConfig.urls.docsHomePath].title = "Something else";
  assert.notDeepEqual(changed, expected);
});

test("the docs social links use AppConfig.socials with their own labels", () => {
  // covers: AC-10
  const config = readFileSync(new URL("../../astro.config.mjs", import.meta.url), "utf8");
  for (const [icon, label] of [
    ["facebook", "Facebook"],
    ["instagram", "Instagram"],
    ["tiktok", "TikTok"],
  ]) {
    assert.match(
      config,
      new RegExp(`\\{ icon: "${icon}", label: "${label}", href: AppConfig\\.socials\\.${icon} \\}`),
      `${icon} link`,
    );
  }
});
