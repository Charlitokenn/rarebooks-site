// Signed calls from this Worker to the control site's onboarding endpoints (spec 0014 AC-8).
//
// Every call is a POST to `rarebooks_control.onboarding.<name>`, signed with `CONTROL_SIGNING_SECRET` (the
// control site's `marketing_secret`). An answer counts only when it is signed with the same secret and echoes
// this call's `issued_at`; anything else, or a network failure, is `ControlUnreachable`.

import { env } from "cloudflare:workers";

import { SIGNATURE_HEADER, isValidSignature, issuedNow, sign } from "./signing.ts";

// The API routes wait up to 15 seconds; the /welcome page and /welcome/open pass 5 (spec 0023 AC-3, AC-4).
const TIMEOUT_MS = 15_000;

export type ControlMethod = "check_subdomain" | "request_site" | "signup_status" | "owner_link";

export class ControlUnreachable extends Error {}

export interface ControlAnswer {
  status: number;
  body: Record<string, unknown>;
}

function controlUrl(): string | null {
  const url = (env.CONTROL_SITE_URL || "").replace(/\/+$/, "");
  return url.startsWith("https://") ? url : null;
}

export async function callControl(
  method: ControlMethod,
  payload: Record<string, unknown>,
  timeoutMs: number = TIMEOUT_MS,
): Promise<ControlAnswer> {
  const url = controlUrl();
  const secret = env.CONTROL_SIGNING_SECRET;
  if (!url || !secret) {
    throw new ControlUnreachable("The control site URL or signing secret is not set");
  }
  const issuedAt = issuedNow();
  const body = JSON.stringify({ ...payload, issued_at: issuedAt });
  let response: Response;
  try {
    response = await fetch(`${url}/api/method/rarebooks_control.onboarding.${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", [SIGNATURE_HEADER]: await sign(body, secret) },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new ControlUnreachable(`${method} failed: ${(error as Error).name}`);
  }
  const raw = new Uint8Array(await response.arrayBuffer());
  if (!(await isValidSignature(raw, response.headers.get(SIGNATURE_HEADER), secret))) {
    throw new ControlUnreachable(`${method} answered ${response.status} without a valid signature`);
  }
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    data = null;
  }
  // A 401 carries no echo; it is a failure either way.
  if (!data || typeof data !== "object" || (data as { issued_at?: unknown }).issued_at !== issuedAt) {
    throw new ControlUnreachable(`${method} answered ${response.status} without the echo of its issued_at`);
  }
  return { status: response.status, body: data as Record<string, unknown> };
}
