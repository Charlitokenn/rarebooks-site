// The signed in user's request (spec 0014 AC-4), polled by the /welcome waiting card. The read itself is
// `readSignupStatus`, shared with the /welcome page (spec 0023 AC-3); this route keeps its answers and its
// 15 second control call.

import type { APIRoute } from "astro";

import { failure, json } from "../../../lib/onboarding/http.ts";
import { readSignupStatus } from "../../../lib/onboarding/status.ts";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const read = await readSignupStatus(locals);
  if (read.kind === "signed_out") {
    return failure("Sign in first.", 401);
  }
  if (read.kind === "none") {
    return failure("No site requested yet.", 404);
  }
  if (read.kind === "unreachable") {
    return failure("We couldn't read your site's status just now.", 503);
  }
  // Never `failed_reason`; the address for every status but Failed (spec 0023 AC-8).
  return json({ request_id: read.request_id, status: read.status, step: read.step, address: read.address });
};
