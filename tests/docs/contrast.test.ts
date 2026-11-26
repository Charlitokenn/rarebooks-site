// The docs palette keeps WCAG 2.2 AA contrast in light and dark (spec 0024 AC-7). The pairs below are the spec's
// Docs allowed pairs table and its forbidden list; a token change that breaks one fails `npm test`. The asides
// keep Starlight's own hues, read from the installed Starlight, and their text is checked too.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { contrastRatio, isHex6, parseTokens } from "../../src/lib/marketing/tokens.ts";

const tokens = parseTokens(readFileSync(new URL("../../src/styles/mk-tokens.css", import.meta.url), "utf8"));
const docsCss = readFileSync(new URL("../../src/styles/docs.css", import.meta.url), "utf8");
const color = (name: string) => tokens[`--color-mk-${name}`];

type Theme = "light" | "dark";
// Normal text needs 4.5:1; UI parts and large text need 3:1.
const ALLOWED: [theme: Theme, foreground: string, background: string, needs: number][] = [
  ["light", "docs-text", "canvas", 4.5],
  ["light", "docs-text", "docs-raised", 4.5],
  ["light", "docs-text", "border", 4.5], // inline code
  ["light", "subtle", "canvas", 4.5],
  ["light", "subtle", "docs-raised", 4.5],
  ["light", "brand", "canvas", 4.5], // links
  ["light", "brand", "docs-raised", 4.5],
  ["light", "brand-strong", "tint", 4.5], // current page
  ["light", "on-dark", "brand", 4.5], // the button
  ["light", "ink", "canvas", 4.5], // logo, nav links, headings
  ["dark", "dark-text", "dark-canvas", 4.5],
  ["dark", "dark-text", "dark-raised", 4.5],
  ["dark", "dark-text", "dark-line", 4.5], // inline code
  ["dark", "dark-subtle", "dark-canvas", 4.5],
  ["dark", "dark-subtle", "dark-raised", 4.5],
  ["dark", "focus-on-dark", "dark-canvas", 4.5], // links
  ["dark", "focus-on-dark", "dark-raised", 4.5],
  ["dark", "focus-on-dark", "dark-brand-low", 4.5], // current page
  ["dark", "on-dark", "brand", 4.5], // the button, both themes
  ["dark", "dark-strong", "dark-canvas", 4.5], // logo, nav
  ["dark", "dark-faint", "dark-canvas", 3], // UI only
  ["light", "docs-faint", "canvas", 3], // UI only
  ["light", "focus", "canvas", 3], // focus ring
  ["dark", "focus-on-dark", "dark-canvas", 3], // focus ring
];

// The faint colors are decoration only: each must really fail body text contrast, so nobody uses it as text.
const FORBIDDEN: [theme: Theme, foreground: string, background: string, below: number][] = [
  ["light", "docs-faint", "canvas", 4.5],
  ["dark", "dark-faint", "dark-canvas", 4.5],
];

test("every docs palette token exists and is a 6 digit hex value", () => {
  // covers: AC-7
  const names = new Set([...ALLOWED, ...FORBIDDEN].flatMap(([, fg, bg]) => [fg, bg]));
  for (const name of names) {
    assert.ok(color(name), `--color-mk-${name} is missing`);
    assert.ok(isHex6(color(name)), `--color-mk-${name} is "${color(name)}"`);
  }
});

test("every docs allowed pair passes WCAG 2.2 AA", () => {
  // covers: AC-7
  const failures: string[] = [];
  for (const [theme, fg, bg, needs] of ALLOWED) {
    const ratio = contrastRatio(color(fg), color(bg));
    if (ratio < needs) failures.push(`${theme}: mk-${fg} on mk-${bg}: ${ratio.toFixed(2)}, needs ${needs}`);
  }
  assert.deepEqual(failures, []);
});

test("the faint colors fail body text contrast, so they stay decoration only", () => {
  // covers: AC-7
  const passing: string[] = [];
  for (const [theme, fg, bg, below] of FORBIDDEN) {
    const ratio = contrastRatio(color(fg), color(bg));
    if (ratio >= below) passing.push(`${theme}: mk-${fg} on mk-${bg}: ${ratio.toFixed(2)}, must stay under ${below}`);
  }
  assert.deepEqual(passing, []);
});

// --- The Starlight mapping in docs.css -------------------------------------------------------------

/** The `--sl-*` and `--mk-*` declarations of the first unlayered rule with exactly this selector. */
function mapping(selector: string): Record<string, string> {
  const css = docsCss.replace(/\/\*[\s\S]*?\*\//g, "");
  const escaped = selector.replace(/[[\]"().]/g, "\\$&");
  const match = css.match(new RegExp(`(^|[;}])\\s*${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `docs.css has no "${selector}" rule`);
  const out: Record<string, string> = {};
  for (const [, name, value] of match[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[name] = value.trim();
  return out;
}

const MAPPINGS: Record<Theme, Record<string, string>> = {
  dark: mapping(":root"),
  light: mapping(':root[data-theme="light"]'),
};

/** The hex a mapped variable resolves to through `var(--color-mk-*)`. */
function mapped(theme: Theme, variable: string): string {
  const value = MAPPINGS[theme][variable];
  const token = value?.match(/^var\(--color-mk-([\w-]+)\)$/)?.[1];
  assert.ok(token, `${theme} ${variable} is "${value}", not var(--color-mk-*)`);
  assert.ok(color(token), `${theme} ${variable} points at a missing token`);
  return color(token);
}

test("docs.css writes no color value: every mapped color is var(--color-mk-*)", () => {
  // covers: AC-1, AC-2
  const css = docsCss.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.deepEqual(css.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/gi), null);
  for (const theme of ["light", "dark"] as const) {
    for (const [name, value] of Object.entries(MAPPINGS[theme])) {
      if (/^--sl-color-|^--mk-/.test(name)) mapped(theme, name);
      else assert.ok(!/#|rgb|hsl/.test(value), `${theme} ${name} is "${value}"`);
    }
  }
});

test("the mapped page text, links and current page pass in both themes", () => {
  // covers: AC-7
  const failures: string[] = [];
  const pairs: [string, string, number][] = [
    ["--sl-color-gray-2", "--sl-color-black", 4.5], // body text on the page
    ["--sl-color-gray-3", "--sl-color-black", 4.5], // secondary text
    ["--sl-color-white", "--sl-color-black", 4.5], // headings
    ["--mk-link", "--sl-color-black", 4.5], // links
    ["--mk-subtle", "--sl-color-black", 4.5], // footer strip
    ["--mk-docs-strong", "--sl-color-bg-nav", 4.5], // logo and nav
    ["--mk-focus", "--sl-color-bg-nav", 3], // focus ring
    ["--sl-color-accent-high", "--sl-color-accent-low", 4.5], // current page in the sidebar
  ];
  for (const theme of ["light", "dark"] as const) {
    for (const [fg, bg, needs] of pairs) {
      const ratio = contrastRatio(mapped(theme, fg), mapped(theme, bg));
      if (ratio < needs) failures.push(`${theme}: ${fg} on ${bg}: ${ratio.toFixed(2)}, needs ${needs}`);
    }
  }
  assert.deepEqual(failures, []);
});

// --- Asides: Starlight's own hues -------------------------------------------------------------------

// props.css isn't in Starlight's package exports, so it is read from node_modules directly.
const starlightProps = readFileSync(
  new URL("../../node_modules/@astrojs/starlight/style/props.css", import.meta.url),
  "utf8",
);

/** A Starlight props block: the first `:root` block (dark) or the light theme block. */
function starlightBlock(theme: Theme): string {
  const start =
    theme === "dark" ? starlightProps.indexOf(":root,") : starlightProps.indexOf(":root[data-theme='light']");
  assert.ok(start >= 0, `no ${theme} block in Starlight's props.css`);
  const open = starlightProps.indexOf("{", start);
  return starlightProps.slice(open + 1, starlightProps.indexOf("}", open));
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Starlight's hex for `--sl-color-<hue>-<step>` in a theme. Hue numbers come from the dark block. */
function starlightHue(theme: Theme, hue: string, step: "low" | "high"): string {
  const hueValue = Number(starlightBlock("dark").match(new RegExp(`--sl-hue-${hue}:\\s*(\\d+)`))?.[1]);
  const decl = starlightBlock(theme).match(
    new RegExp(`--sl-color-${hue}-${step}:\\s*hsl\\(var\\(--sl-hue-${hue}\\),\\s*(\\d+)%,\\s*(\\d+)%\\)`),
  );
  assert.ok(!Number.isNaN(hueValue) && decl, `Starlight ${theme} --sl-color-${hue}-${step} not found`);
  return hslToHex(hueValue, Number(decl[1]), Number(decl[2]));
}

test("aside text and titles pass on Starlight's aside backgrounds in both themes", () => {
  // covers: AC-7
  const asides = { note: "blue", tip: "purple", caution: "orange", danger: "red" };
  const failures: string[] = [];
  for (const theme of ["light", "dark"] as const) {
    for (const [aside, hue] of Object.entries(asides)) {
      const background = starlightHue(theme, hue, "low");
      const body = contrastRatio(mapped(theme, "--sl-color-white"), background);
      const title = contrastRatio(starlightHue(theme, hue, "high"), background);
      if (body < 4.5) failures.push(`${theme} ${aside} text: ${body.toFixed(2)}`);
      if (title < 4.5) failures.push(`${theme} ${aside} title: ${title.toFixed(2)}`);
    }
  }
  assert.deepEqual(failures, []);
});
