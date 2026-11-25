// The signed in user's request (spec 0014 AC-4). Found by Clerk user id in D1, or, when D1 has no row, by
// asking the control site with the Clerk user id alone, which also writes the missing row. A signed 404 for a
// D1 row means the row is stale (a released sign up, spec 0016 AC-8), so the row is dropped.

import type { APIRoute } from "astro";

import { ControlUnreachable, callControl } from "../../../lib/onboarding/control.ts";
import { failure, json } from "../../../lib/onboarding/http.ts";
import { signedInUserId } from "../../../lib/onboarding/owner.ts";
import { earlierSignup } from "../../../lib/onboarding/earlier.ts";
import { deleteSignup, saveSignup, signupByUser } from "../../../lib/onboarding/signups.ts";

export const prerender = false;

const STATUSES = new Set(["Queued", "Claiming", "Preparing", "Ready", "Failed"]);

export const GET: APIRoute = async ({ locals }) => {
  const userId = signedInUserId(locals);
  if (!userId) {
    return failure("Sign in first.", 401);
  }
  const row = await signupByUser(userId);
  const payload: Record<string, unknown> = { clerk_user_id: userId };
  if (row) {
    payload.request_id = row.request_id;
  }
  let answer;
  try {
    answer = await callControl("signup_status", payload);
  } catch (error) {
    if (!(error instanceof ControlUnreachable)) {
      throw error;
    }
    console.error("status:", error.message);
    return failure("We couldn't read your site's status just now.", 503);
  }
  if (answer.status === 404) {
    if (row && earlierSignup(answer, row.request_id) === "stale") {
      await deleteSignup(userId, row.request_id);
    }
    return failure("No site requested yet.", 404);
  }
  const { request_id: requestId, status, step, address, email } = answer.body;
  if (answer.status !== 200 || typeof requestId !== "string" || !STATUSES.has(String(status))) {
    return failure("We couldn't read your site's status just now.", 503);
  }
  if (!row && typeof email === "string") {
    await saveSignup(userId, email, requestId);
  }
  // Never `failed_reason`; the address only once Ready.
  return json({
    request_id: requestId,
    status,
    step: step ?? null,
    address: status === "Ready" && typeof address === "string" ? address : null,
  });
};
