// One person, one site (spec 0014 AC-9). The control site's `onboarding.email_key` follows the same rule, and
// both are tested against the same `email_key_cases.json`.

/**
 * The email trimmed and lowercased; `googlemail.com` becomes `gmail.com`; for `gmail.com` the local part loses
 * every dot and anything from the first `+`.
 */
export function emailKey(email: string): string {
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  let local = at >= 0 ? value.slice(0, at) : "";
  let domain = at >= 0 ? value.slice(at + 1) : value;
  if (domain === "googlemail.com") {
    domain = "gmail.com";
  }
  if (domain === "gmail.com") {
    local = local.split("+", 1)[0].replaceAll(".", "");
  }
  return `${local}@${domain}`;
}
