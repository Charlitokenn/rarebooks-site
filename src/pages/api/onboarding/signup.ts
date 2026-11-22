// A sign up (spec 0014 AC-3): Turnstile first, then the IP limit, then the control site's `request_site`.
// A failed Turnstile (403) or an attempt over the limit (429) never reaches the control site.

import type { APIRoute } from "astro";

import { AppConfig } from "../../../constants";
import { ControlUnreachable, callControl } from "../../../lib/onboarding/control.ts";
import { failure, json, readJson } from "../../../lib/onboarding/http.ts";
import { signupOverLimit } from "../../../lib/onboarding/limits.ts";
import { verifiedOwner } from "../../../lib/onboarding/owner.ts";
import { saveSignup, signupByUser } from "../../../lib/onboarding/signups.ts";
import { turnstilePassed } from "../../../lib/onboarding/turnstile.ts";

export const prerender = false;

const ZONE_MAX = 64;

/** The browser's IANA zone, or UTC when it sent none (AC-1). The control site checks the zone is real. */
function timeZone(value: unknown): string {
  return typeof value === "string" && value && value.length <= ZONE_MAX ? value : "UTC";
}

export const POST: APIRoute = async ({ request, locals }) => {
  const owner = await verifiedOwner(locals);
  if (!owner) {
    return failure("Sign in with a verified email first.", 401);
  }
  const data = await readJson(request);
  if (!data) {
    return failure("Invalid JSON in request body", 400);
  }

  // A user who already has a request gets it back, without counting (AC-3).
  const existing = await signupByUser(owner.clerkUserId);
  if (existing) {
    return json({ request_id: existing.request_id });
  }

  const ip = request.headers.get("CF-Connecting-IP");
  if (!(await turnstilePassed(data.turnstile_token, ip))) {
    return failure("The check that you're a person didn't pass. Try again.", 403);
  }
  if (await signupOverLimit(ip || "unknown")) {
    return failure("Too many sign ups from your network. Try again in an hour.", 429);
  }

  const company = typeof data.company_name === "string" ? data.company_name.trim() : "";
  if (!company || company.length > 140) {
    return failure("A company name is 1 to 140 characters.", 422, { field: "company_name" });
  }

  let answer;
  try {
    answer = await callControl("request_site", {
      clerk_user_id: owner.clerkUserId,
      email: owner.email,
      first_name: owner.firstName,
      last_name: owner.lastName,
      company_name: company,
      subdomain: typeof data.subdomain === "string" ? data.subdomain : "",
      time_zone: timeZone(data.time_zone),
    });
  } catch (error) {
    if (!(error instanceof ControlUnreachable)) {
      throw error;
    }
    console.error("signup:", error.message);
    return failure("We couldn't start your site just now. Try again.", 503);
  }

  const refusal = answer.body.refusal;
  if (answer.status === 200 && typeof answer.body.request_id === "string") {
    await saveSignup(owner.clerkUserId, owner.email, answer.body.request_id);
    return json({ request_id: answer.body.request_id, status: answer.body.status });
  }
  if (answer.status === 409 && refusal === "already_used") {
    return failure(
      `This email already has a RareBooks site. Contact support at ${AppConfig.emails.supportEmail}.`,
      409,
      { refusal },
    );
  }
  if (answer.status === 422) {
    const field = refusal === "subdomain" ? "subdomain" : "company_name";
    return failure(String(answer.body.reason ?? "Check the form."), 422, { field });
  }
  if (answer.status === 503 && refusal === "paused") {
    return failure("New sign ups are paused for a moment. Try again later.", 503, { refusal });
  }
  if (answer.status === 429) {
    return failure("Too many sign ups right now. Try again in a minute.", 429);
  }
  return failure("We couldn't start your site just now. Try again.", 503);
};
