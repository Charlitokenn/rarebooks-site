// Resizes the marketing screenshots once, ahead of time (spec 0017, Screenshots). The Cloudflare adapter uses
// `imageService: "passthrough"` and the pages render on demand, so Astro can't resize them at request time.
//
//   npm run screenshots
//
// Reads every PNG or JPG in src/assets/screenshots/source/, writes public/screenshots/<name>-<width>.avif and
// .webp at each width in WIDTHS no larger than the source, then writes src/data/screenshots.json, which
// MkScreenshotFrame reads: { <name>: { width, height, widths } }. Commit the sources, the images and the JSON.

import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { extname, basename, join } from "node:path";
import sharp from "sharp";

const SOURCE = "src/assets/screenshots/source";
const OUT = "public/screenshots";
const MANIFEST = "src/data/screenshots.json";
const WIDTHS = [640, 960, 1280, 1920];

mkdirSync(OUT, { recursive: true });

const manifest = {};
const files = readdirSync(SOURCE)
  .filter((file) => /\.(png|jpe?g)$/i.test(file))
  .sort();

for (const file of files) {
  const name = basename(file, extname(file));
  const input = join(SOURCE, file);
  const { width, height } = await sharp(input).metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  // A source narrower than the smallest width still gets one file, at its own size.
  if (widths.length === 0) widths.push(width);

  for (const w of widths) {
    const resized = sharp(input).resize({ width: w });
    await resized.clone().avif({ quality: 55 }).toFile(join(OUT, `${name}-${w}.avif`));
    await resized.clone().webp({ quality: 78 }).toFile(join(OUT, `${name}-${w}.webp`));
  }

  manifest[name] = { width, height, widths };
  console.log(`${name}: ${width}x${height}, ${widths.join(", ")}`);
}

writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${MANIFEST}`);
