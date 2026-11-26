// Reads the mk design tokens out of mk-tokens.css and measures contrast (spec 0017 AC-5, AC-8; spec 0024 AC-1).
// Pure functions with no imports or path aliases, so `node --test` runs them as they are and the preview
// page can call them on the CSS it imports with `?raw`.

export type Tokens = Record<string, string>;

/**
 * Every `--<group>-mk-*` declaration (and `--container-mk`) inside the `@theme static` block of `css`,
 * keyed by its full custom property name, in source order. Declarations outside that block are ignored.
 */
export function parseTokens(css: string): Tokens {
  const block = themeStaticBlock(css);
  const tokens: Tokens = {};
  const declaration = /(--[a-z]+-mk(?:-[a-z0-9-]+)?)\s*:\s*([^;]+);/g;
  for (const match of block.matchAll(declaration)) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

/** The body of the first `@theme static { ... }` block, matched by brace depth. */
function themeStaticBlock(css: string): string {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = withoutComments.search(/@theme\s+static\s*\{/);
  if (start === -1) return "";
  const open = withoutComments.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < withoutComments.length; i++) {
    if (withoutComments[i] === "{") depth++;
    if (withoutComments[i] === "}") depth--;
    if (depth === 0) return withoutComments.slice(open + 1, i);
  }
  return "";
}

/** True for a 6 digit hex color such as `#5b3df5`. */
export function isHex6(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

/** WCAG 2.x relative luminance of a 6 digit hex color. */
export function relativeLuminance(hex: string): number {
  if (!isHex6(hex)) throw new Error(`Not a 6 digit hex color: ${hex}`);
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two 6 digit hex colors, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
