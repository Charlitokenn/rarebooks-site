// The live subdomain check behind the start form (spec 0014 AC-2): cached 30 seconds per label, at most 30 a
// minute per Clerk user, and a cache miss asks the control site's `check_subdomain`.

import type { APIRoute } from "astro";

import { ControlUnreachable, callControl } from "../../../lib/onboarding/control.ts";
import { failure, json, readJson } from "../../../lib/onboarding/http.ts";
import { cacheCheck, cachedCheck, checkOverLimit } from "../../../lib/onboarding/limits.ts";
import { signedInUserId } from "../../../lib/onboarding/owner.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const userId = signedInUserId(locals);
  if (!userId) {
    return failure("Sign in first.", 401);
  }
  const data = await readJson(request);
  const label = typeof data?.subdomain === "string" ? data.subdomain.trim().toLowerCase() : "";
  if (!label || label.length > 63) {
    return json({ available: false, reason: "Enter a subdomain." });
  }
  if (await checkOverLimit(userId)) {
    return failure("Slow down.", 429, { reason: "slow_down" });
  }
  const cached = await cachedCheck(label);
  if (cached) {
    return json(cached);
  }
  try {
    const answer = await callControl("check_subdomain", { subdomain: label });
    if (answer.status === 200 && typeof answer.body.available === "boolean") {
      const result = answer.body.available
        ? { available: true }
        : { available: false, reason: String(answer.body.reason ?? "taken") };
      await cacheCheck(label, result);
      return json(result);
    }
    if (answer.status === 429) {
      return failure("Slow down.", 429, { reason: "slow_down" });
    }
  } catch (error) {
    if (!(error instanceof ControlUnreachable)) {
      throw error;
    }
    console.error("check-subdomain:", error.message);
  }
  return failure("We couldn't check that name just now. Try again.", 503);
};
