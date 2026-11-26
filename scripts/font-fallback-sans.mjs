// Prints the size adjusted "Plus Jakarta Sans Fallback" @font-face overrides for docs.css (spec 0024 AC-6).
// Run once whenever the Plus Jakarta Sans files change, then copy the printed values into docs.css:
//
//   node scripts/font-fallback-sans.mjs
//   node scripts/font-fallback-sans.mjs --regular <arial.ttf> --bold <arial-bold.ttf>
//
// Arial is the reference fallback (Windows, macOS and iOS ship it; Linux ships the metric compatible
// Liberation Sans). By default the script measures Liberation Sans from its usual Linux path.

import { readFileSync } from "node:fs";
import * as fontkit from "fontkit";

const JAKARTA = (weight) =>
  `node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${weight}-normal.woff2`;

// Each docs weight and the reference face it falls back to (600 falls back to the bold face).
const WEIGHTS_USED = [
  { weight: 400, reference: "regular" },
  { weight: 600, reference: "bold" },
  { weight: 700, reference: "bold" },
];

function arg(name, fallback) {
  const flag = process.argv.indexOf(name);
  return flag === -1 ? fallback : process.argv[flag + 1];
}

const REFERENCE_FILES = {
  regular: arg("--regular", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"),
  bold: arg("--bold", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"),
};

// English letter frequency (percent), with the space, as used by Capsize to compute xWidthAvg.
const LETTERS = {
  a: 6.68, b: 1.22, c: 2.28, d: 3.48, e: 10.4, f: 1.82, g: 1.65, h: 4.98, i: 5.7, j: 0.13, k: 0.63,
  l: 3.29, m: 1.97, n: 5.52, o: 6.15, p: 1.58, q: 0.08, r: 4.9, s: 5.18, t: 7.42, u: 2.25, v: 0.8,
  w: 1.93, x: 0.12, y: 1.61, z: 0.06, " ": 18.31,
};

function averageWidthPerEm(font) {
  let total = 0;
  let share = 0;
  for (const [char, weight] of Object.entries(LETTERS)) {
    total += font.glyphForCodePoint(char.codePointAt(0)).advanceWidth * weight;
    share += weight;
  }
  return total / share / font.unitsPerEm;
}

const percent = (value) => `${(value * 100).toFixed(2)}%`;

for (const { weight, reference } of WEIGHTS_USED) {
  const font = fontkit.create(readFileSync(JAKARTA(weight)));
  const ref = fontkit.create(readFileSync(REFERENCE_FILES[reference]));
  const em = font.unitsPerEm;
  const sizeAdjust = averageWidthPerEm(font) / averageWidthPerEm(ref);
  console.log(`/* Plus Jakarta Sans Fallback, ${weight} (${reference} reference) */`);
  console.log(`size-adjust: ${percent(sizeAdjust)};`);
  console.log(`ascent-override: ${percent(font.ascent / em / sizeAdjust)};`);
  console.log(`descent-override: ${percent(Math.abs(font.descent) / em / sizeAdjust)};`);
  console.log(`line-gap-override: ${percent(font.lineGap / em / sizeAdjust)};`);
  console.log("");
}
