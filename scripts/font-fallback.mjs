// Prints the size adjusted "Fraunces Fallback" @font-face overrides for marketing.css (spec 0017 AC-7).
// Run once whenever the Fraunces files change, then copy the printed values into marketing.css:
//
//   node scripts/font-fallback.mjs                         (Georgia from its published metrics)
//   node scripts/font-fallback.mjs --georgia <georgia.ttf> (Georgia measured from the font file itself)
//
// Georgia is the reference fallback (Windows, macOS and iOS ship it). Its metrics are not readable on a
// machine without the font, so by default the script uses the values Capsize publishes for it
// (@capsizecss/metrics, "georgia"). Pass --georgia with the real file to measure it the same way as Fraunces.

import { readFileSync } from "node:fs";
import * as fontkit from "fontkit";

const FILES = {
  normal: "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
  italic: "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2",
};

// The weight MkHeading uses for display, h1 and h2.
const HEADING_WEIGHT = 500;

// Capsize's published metrics for Georgia (units per em 2048). xWidthAvg is the advance width averaged over
// English letter frequency, the same weighting used for Fraunces below.
const GEORGIA = { unitsPerEm: 2048, ascent: 1878, descent: -449, lineGap: 0, xWidthAvg: 913 };

// English letter frequency (percent), with the space, as used by Capsize to compute xWidthAvg.
const WEIGHTS = {
  a: 6.68, b: 1.22, c: 2.28, d: 3.48, e: 10.4, f: 1.82, g: 1.65, h: 4.98, i: 5.7, j: 0.13, k: 0.63,
  l: 3.29, m: 1.97, n: 5.52, o: 6.15, p: 1.58, q: 0.08, r: 4.9, s: 5.18, t: 7.42, u: 2.25, v: 0.8,
  w: 1.93, x: 0.12, y: 1.61, z: 0.06, " ": 18.31,
};

function weightedAverageWidth(font) {
  let total = 0;
  let weight = 0;
  for (const [char, share] of Object.entries(WEIGHTS)) {
    const glyph = font.glyphForCodePoint(char.codePointAt(0));
    total += glyph.advanceWidth * share;
    weight += share;
  }
  return total / weight;
}

function georgiaMetrics() {
  const flag = process.argv.indexOf("--georgia");
  if (flag === -1) return GEORGIA;
  const font = fontkit.create(readFileSync(process.argv[flag + 1]));
  return {
    unitsPerEm: font.unitsPerEm,
    ascent: font.ascent,
    descent: font.descent,
    lineGap: font.lineGap,
    xWidthAvg: weightedAverageWidth(font),
  };
}

const percent = (value) => `${(value * 100).toFixed(2)}%`;

const reference = georgiaMetrics();
const referenceWidth = reference.xWidthAvg / reference.unitsPerEm;

for (const [style, path] of Object.entries(FILES)) {
  const font = fontkit.create(readFileSync(path)).getVariation({ wght: HEADING_WEIGHT });
  const em = font.unitsPerEm;
  const sizeAdjust = weightedAverageWidth(font) / em / referenceWidth;
  console.log(`/* Fraunces Fallback, ${style} */`);
  console.log(`size-adjust: ${percent(sizeAdjust)};`);
  console.log(`ascent-override: ${percent(font.ascent / em / sizeAdjust)};`);
  console.log(`descent-override: ${percent(Math.abs(font.descent) / em / sizeAdjust)};`);
  console.log(`line-gap-override: ${percent(font.lineGap / em / sizeAdjust)};`);
  console.log("");
}
