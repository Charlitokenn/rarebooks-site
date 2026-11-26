// No docs page loads tawk.to, PostHog, Google Tag Manager or Clerk (spec 0024 AC-11). The only scripts on a docs
// page are Starlight's own: inline, or served from /_astro/. Clerk's integration puts its page script on every
// page, so a docs page's /_astro/ scripts, and every module they import statically, must not contain Clerk's
// loader; src/lib/docs/clerkGuard.ts loads it with a dynamic import, only off the docs. Reads the build in
// dist/client; with no build the checks are skipped, with a message saying so.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CLIENT_DIR, SNAPSHOT_FILE } from "../../scripts/docs-head-snapshot.mjs";

const built = existsSync(CLIENT_DIR);
const skip = built ? false : "no build in dist/client: run `npm run build` first";
const routes: string[] = Object.keys(JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8")));

const THIRD_PARTY = /tawk\.to|posthog|googletagmanager|gtag\(|clerk/i;
// Strings only Clerk's browser script loader carries (it builds the clerk.browser.js CDN URL).
const CLERK_LOADER = /clerk\.browser\.js|@clerk\/clerk-js/;

const html = (route: string) => readFileSync(join(CLIENT_DIR, route, "index.html"), "utf8");

/** Every `<script ...>` opening tag and its src, if any. */
function scripts(page: string): { tag: string; src: string | null }[] {
  return [...page.matchAll(/<script\b[^>]*>/g)].map(([tag]) => ({ tag, src: tag.match(/\bsrc="([^"]*)"/)?.[1] ?? null }));
}

/** A built module and every module it imports statically, as file paths under dist/client. */
function staticClosure(src: string, seen = new Set<string>()): Set<string> {
  const file = join(CLIENT_DIR, src);
  if (seen.has(file)) return seen;
  seen.add(file);
  const code = readFileSync(file, "utf8");
  // Static imports only (`import x from"./a.js"`, `import"./a.js"`); `import("./a.js")` is dynamic and skipped.
  for (const [, path] of code.matchAll(/(?:\bfrom|\bimport)\s*"(\.\/[^"]+\.js)"/g)) {
    staticClosure(new URL(path, `file:///${src}`).pathname, seen);
  }
  return seen;
}

test("every docs page loads only inline scripts or scripts from /_astro/", { skip }, () => {
  // covers: AC-11
  const outside: string[] = [];
  for (const route of routes) {
    for (const { src } of scripts(html(route))) {
      if (src !== null && !src.startsWith("/_astro/")) outside.push(`${route}: ${src}`);
    }
  }
  assert.deepEqual(outside, []);
});

test("no docs page names tawk.to, PostHog, Google Tag Manager or Clerk in its HTML", { skip }, () => {
  // covers: AC-11
  const found: string[] = [];
  for (const route of routes) {
    const page = html(route);
    const inline = [...page.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(([, body]) => body).join("\n");
    const tags = scripts(page).map(({ tag }) => tag).join("\n");
    const hit = `${inline}\n${tags}`.match(THIRD_PARTY);
    if (hit) found.push(`${route}: ${hit[0]}`);
  }
  assert.deepEqual(found, []);
});

test("no docs page's scripts statically load Clerk's browser script loader", { skip }, () => {
  // covers: AC-11
  const found: string[] = [];
  const srcs = new Set(routes.flatMap((route) => scripts(html(route)).flatMap(({ src }) => (src ? [src] : []))));
  for (const src of srcs) {
    for (const file of staticClosure(src)) {
      if (CLERK_LOADER.test(readFileSync(file, "utf8"))) found.push(`${src} -> ${file.slice(CLIENT_DIR.length)}`);
    }
  }
  assert.deepEqual(found, []);
});

test("the docs pages carry the marker the Clerk guard reads", { skip }, () => {
  // covers: AC-11
  const missing = routes.filter((route) => !html(route).includes('<meta name="rarebooks-page" content="docs">'));
  assert.deepEqual(missing, []);
});
