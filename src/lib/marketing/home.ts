// Helpers for the homepage copy (spec 0019). No imports or path aliases, so `node --test` runs them as
// they are.

/**
 * Fills each `{name}` in `template` with `values[name]`, inserted exactly as stored (AC-3). A placeholder
 * with no value throws, so a typo fails the build instead of showing braces to a visitor.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    if (!(name in values)) throw new Error(`No value for {${name}} in "${template}"`);
    return String(values[name]);
  });
}

/**
 * Splits a headline at its one `*word*` (the MkHighlight word): `[before, word, after]`. With no star pair
 * the word is empty.
 */
export function splitHighlight(text: string): [string, string, string] {
  const match = /^(.*?)\*([^*]+)\*(.*)$/.exec(text);
  return match ? [match[1], match[2], match[3]] : [text, "", ""];
}
