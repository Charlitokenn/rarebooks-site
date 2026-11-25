// HTML escaping for text that reaches `set:html` (spec 0021, Data model sketch). No imports, so
// `node --test` runs it.

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** `text` with `&`, `<`, `>`, `"` and `'` written as entities, so it shows as text, never as markup. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => entities[char]);
}
