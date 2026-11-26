// The marketing color tokens keep WCAG 2.2 AA contrast (spec 0017 AC-5). The pairs below are the spec's
// Allowed pairs table and Forbidden pairs list; a token change that breaks one fails `npm test`.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { contrastRatio, isHex6, parseTokens } from "../../src/lib/marketing/tokens.ts";

const css = readFileSync(new URL("../../src/styles/mk-tokens.css", import.meta.url), "utf8");
const tokens = parseTokens(css);

// Normal text needs 4.5:1; large text and UI parts (button borders, focus rings, check icons) need 3:1.
const ALLOWED: [foreground: string, backgrounds: string[], needs: number][] = [
  ["ink", ["canvas", "surface", "tint", "pink"], 4.5],
  ["subtle", ["canvas", "surface", "tint", "pink"], 4.5],
  ["brand", ["canvas", "surface", "tint", "pink"], 4.5],
  ["on-dark", ["brand", "brand-strong", "ink"], 4.5],
  ["on-dark-subtle", ["ink"], 4.5],
  ["ink", ["on-dark"], 4.5], // the white on-dark button on the ink band
  ["focus", ["canvas", "tint", "pink", "surface"], 3],
  ["focus-on-dark", ["ink"], 3],
  ["pink-strong", ["ink"], 3], // the highlight underline on ink, decorative
];

// Each must really fail, so nobody adds it later by mistake.
const FORBIDDEN: [foreground: string, background: string, below: number][] = [["brand", "ink", 3]];

const color = (name: string) => tokens[`--color-mk-${name}`];

test("mk-tokens.css has an @theme static block with mk color tokens", () => {
  // covers: AC-1
  assert.ok(Object.keys(tokens).some((name) => name.startsWith("--color-mk-")));
});

test("every mk color token is a 6 digit hex value", () => {
  // covers: AC-1, AC-5
  for (const [name, value] of Object.entries(tokens)) {
    if (name.startsWith("--color-mk-")) assert.ok(isHex6(value), `${name} is "${value}"`);
  }
});

test("every token named in the allowed and forbidden pairs exists", () => {
  // covers: AC-5
  const names = new Set([
    ...ALLOWED.flatMap(([fg, bgs]) => [fg, ...bgs]),
    ...FORBIDDEN.flatMap(([fg, bg]) => [fg, bg]),
  ]);
  for (const name of names) assert.ok(color(name), `--color-mk-${name} is missing`);
});

test("every allowed pair passes WCAG 2.2 AA", () => {
  // covers: AC-5
  const failures: string[] = [];
  for (const [fg, bgs, needs] of ALLOWED) {
    for (const bg of bgs) {
      const ratio = contrastRatio(color(fg), color(bg));
      if (ratio < needs) failures.push(`mk-${fg} on mk-${bg}: ${ratio.toFixed(2)}, needs ${needs}`);
    }
  }
  assert.deepEqual(failures, []);
});

test("every forbidden pair really fails", () => {
  // covers: AC-5
  const passing: string[] = [];
  for (const [fg, bg, below] of FORBIDDEN) {
    const ratio = contrastRatio(color(fg), color(bg));
    if (ratio >= below) passing.push(`mk-${fg} on mk-${bg}: ${ratio.toFixed(2)}, must stay under ${below}`);
  }
  assert.deepEqual(passing, []);
});

test("parseTokens reads only the @theme static block", () => {
  // covers: AC-5
  const sample = `
    :root { --color-mk-outside: #000000; }
    @theme static {
      /* --color-mk-commented: #111111; */
      --color-mk-inside: #222222;
      --text-mk-h2--line-height: 1.15;
      --container-mk: 75rem;
    }
    .x { --color-mk-after: #333333; }
  `;
  assert.deepEqual(parseTokens(sample), {
    "--color-mk-inside": "#222222",
    "--text-mk-h2--line-height": "1.15",
    "--container-mk": "75rem",
  });
});

test("contrastRatio matches the WCAG formula", () => {
  // covers: AC-5
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(contrastRatio("#ffffff", "#ffffff"), 1);
  assert.equal(contrastRatio("#ffffff", "#000000"), contrastRatio("#000000", "#ffffff"));
});
