// Lists every built docs page with its title, meta description and canonical link (spec 0024 AC-10), so the
// docs restyle can prove no URL or search engine field changed.
//
//   npm run build
//   node scripts/docs-head-snapshot.mjs            # prints the snapshot as JSON
//   node scripts/docs-head-snapshot.mjs --write    # writes tests/docs/docs-head-snapshot.json
//
// Reads the prerendered HTML under dist/client. A docs page is one Starlight built: its <html> carries
// `data-has-sidebar` or its body holds Starlight's `starlight-theme-select`. Marketing pages render on demand,
// so they have no HTML file there.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const CLIENT_DIR = join(ROOT, "dist", "client");
export const SNAPSHOT_FILE = join(ROOT, "tests", "docs", "docs-head-snapshot.json");

/** Every `index.html` under `dir`, as absolute paths, sorted. */
function htmlFiles(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...htmlFiles(path));
    else if (name === "index.html") found.push(path);
  }
  return found.sort();
}

/** True for a page Starlight rendered. */
export function isStarlightPage(html) {
  return /<starlight-theme-select\b/.test(html) || /<html[^>]*\bdata-has-sidebar\b/.test(html);
}

/** The decoded text of the first match of `pattern`'s first group, or null. */
function first(html, pattern) {
  const match = html.match(pattern);
  return match ? decode(match[1]) : null;
}

function decode(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** The title, description and canonical of one page's HTML. */
export function headOf(html) {
  return {
    title: first(html, /<title>([\s\S]*?)<\/title>/),
    description: first(html, /<meta\s+name="description"\s+content="([^"]*)"/),
    canonical: first(html, /<link\s+rel="canonical"\s+href="([^"]*)"/),
  };
}

/** `{ "/route/": { title, description, canonical } }` for every docs page in `clientDir`, by route. */
export function docsHeadSnapshot(clientDir = CLIENT_DIR) {
  const snapshot = {};
  for (const file of htmlFiles(clientDir)) {
    const html = readFileSync(file, "utf8");
    if (!isStarlightPage(html)) continue;
    const dir = relative(clientDir, file).split(sep).slice(0, -1).join("/");
    snapshot[dir ? `/${dir}/` : "/"] = headOf(html);
  }
  return snapshot;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const snapshot = docsHeadSnapshot();
  const json = `${JSON.stringify(snapshot, null, 2)}\n`;
  if (process.argv.includes("--write")) {
    writeFileSync(SNAPSHOT_FILE, json);
    console.log(`Wrote ${Object.keys(snapshot).length} docs routes to ${relative(ROOT, SNAPSHOT_FILE)}`);
  } else {
    process.stdout.write(json);
  }
}
