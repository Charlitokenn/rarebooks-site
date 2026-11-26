// Spec 0023 AC-10: no link on rarebooks.cc points at /dashboard any more; old links reach /welcome only
// through the middleware map. The pattern matches /dashboard at the start of a path (after a quote, backtick,
// bracket, `=`, white space or the rarebooks.cc host), so a docs path like /basics/dashboard/ still passes.

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const EXTENSIONS = [".ts", ".tsx", ".astro", ".mdx", ".json"];
// The map itself, and the middleware that calls it.
const EXCLUDED = ["src/middleware.ts", "src/lib/redirects.ts"];
const PATTERN = /(?:["'`(\s=]|rarebooks\.cc)\/dashboard(?![\w-])/;

function filesUnder(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = `${dir}/${name}`;
    if (statSync(join(root, path)).isDirectory()) return filesUnder(path);
    return EXTENSIONS.some((ext) => name.endsWith(ext)) && !EXCLUDED.includes(path) ? [path] : [];
  });
}

export function dashboardHits(files: { path: string; text: string }[]): string[] {
  return files.flatMap(({ path, text }) =>
    text
      .split("\n")
      .flatMap((line, index) => (PATTERN.test(line) ? [`${path}:${index + 1}`] : [])),
  );
}

test("no file under src/ links to /dashboard (AC-10)", () => {
  // covers: AC-10
  const files = filesUnder("src").map((path) => ({ path, text: readFileSync(join(root, path), "utf8") }));
  assert.ok(files.length > 50, "the scan found the source files");
  assert.deepEqual(dashboardHits(files), []);
});

test("the guard catches the old link shapes and lets docs paths through (AC-10)", () => {
  // covers: AC-10
  const hit = (text: string) => dashboardHits([{ path: "x", text }]).length === 1;
  assert.ok(hit('<a href="/dashboard">'));
  assert.ok(hit("assign('/dashboard/start')"));
  assert.ok(hit("`${base}/x` or `/dashboard/site/open`"));
  assert.ok(hit("https://rarebooks.cc/dashboard"));
  assert.ok(hit("[your dashboard](/dashboard)"));
  assert.ok(!hit("[dashboard](/basics/dashboard/)"));
  assert.ok(!hit('"/dashboardx"'));
  assert.ok(!hit('name="home-dashboard-tzs"'));
});
