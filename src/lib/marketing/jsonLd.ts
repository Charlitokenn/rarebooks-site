// Structured data text for Layout's `jsonLd` prop (spec 0020 AC-13). No imports, so `node --test` runs it.

/**
 * `JSON.stringify(data)` with every `<` written as `<`, so no string inside it can close the
 * <script type="application/ld+json"> it sits in. JSON parsers read `<` back as `<`.
 */
export function jsonLdText(data: object): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
