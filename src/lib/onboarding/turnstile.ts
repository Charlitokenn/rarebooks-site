// Cloudflare Turnstile, checked on the server with Siteverify before anything else counts (spec 0014 AC-3).

import { env } from "cloudflare:workers";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** True only when Siteverify says the token is good. A missing token, key or a Siteverify failure is false. */
export async function turnstilePassed(token: unknown, ip: string | null): Promise<boolean> {
  if (typeof token !== "string" || !token || token.length > 2048 || !env.TURNSTILE_SECRET_KEY) {
    return false;
  }
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  if (ip) {
    form.append("remoteip", ip);
  }
  try {
    const response = await fetch(SITEVERIFY, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(10_000),
    });
    const outcome = (await response.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false;
  }
}
