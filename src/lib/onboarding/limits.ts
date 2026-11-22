// KV counters and the subdomain check cache (spec 0014 AC-2, AC-3), in the `ONBOARDING_KV` namespace.
//
// KV is eventually consistent, so a counter can run a little over its limit under a burst. That is fine for
// these limits: the control site holds the hard ones (spec 0014 AC-8, AC-10).

import { env } from "cloudflare:workers";

// KV keeps a key at least 60 seconds.
const MIN_TTL_SECONDS = 60;

/** Add one to the counter at `key` and return the new count. */
async function bump(key: string, ttlSeconds: number): Promise<number> {
  const count = Number((await env.ONBOARDING_KV.get(key)) || "0") + 1;
  await env.ONBOARDING_KV.put(key, String(count), { expirationTtl: Math.max(ttlSeconds, MIN_TTL_SECONDS) });
  return count;
}

function utcHour(now: Date = new Date()): string {
  return now.toISOString().slice(0, 13).replace(/[-T]/g, "");
}

function utcMinute(now: Date = new Date()): string {
  return now.toISOString().slice(0, 16).replace(/[-T:]/g, "");
}

/** At most 30 live checks a minute per Clerk user (AC-2). True when this one is over. */
export async function checkOverLimit(clerkUserId: string): Promise<boolean> {
  return (await bump(`check:${clerkUserId}:${utcMinute()}`, 120)) > 30;
}

/** At most 3 sign up attempts an hour per client IP, keyed `signup:<ip>:<UTC hour>` (AC-3). */
export async function signupOverLimit(ip: string): Promise<boolean> {
  return (await bump(`signup:${ip}:${utcHour()}`, 2 * 60 * 60)) > 3;
}

export interface CheckAnswer {
  available: boolean;
  reason?: string;
}

const CHECK_CACHE_SECONDS = 30;

/** Each check answer is kept 30 seconds per label (AC-2). KV's own floor is 60, so the age is checked here. */
export async function cachedCheck(label: string): Promise<CheckAnswer | null> {
  const stored = await env.ONBOARDING_KV.get(`check-cache:${label}`);
  if (!stored) {
    return null;
  }
  try {
    const { at, answer } = JSON.parse(stored) as { at: number; answer: CheckAnswer };
    return Date.now() - at <= CHECK_CACHE_SECONDS * 1000 ? answer : null;
  } catch {
    return null;
  }
}

export async function cacheCheck(label: string, answer: CheckAnswer): Promise<void> {
  await env.ONBOARDING_KV.put(`check-cache:${label}`, JSON.stringify({ at: Date.now(), answer }), {
    expirationTtl: MIN_TTL_SECONDS,
  });
}
