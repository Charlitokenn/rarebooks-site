// Opens the signed in user's own site (spec 0023 AC-4, from spec 0014 AC-5): a fresh password set link while
// they have no password, else the site's `/login`. The only route that asks for the owner link, and only on a
// GET that is not a prefetch. The URL travels only in the `Location` header and is never logged.

import type { APIRoute } from "astro";

import { ControlUnreachable, callControl } from "../../lib/onboarding/control.ts";
import { signedInUserId } from "../../lib/onboarding/owner.ts";
import { isPrefetch } from "../../lib/onboarding/prefetch.ts";
import { signupByUser } from "../../lib/onboarding/signups.ts";

export const prerender = false;

const TIMEOUT_MS = 5_000;
// /welcome?open=retry never redirects, so a failed open can't loop (spec 0023 key invariants).
const RETRY = "/welcome?open=retry";

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" },
  });
}

export const GET: APIRoute = async ({ locals, request }) => {
  if (isPrefetch(request)) {
    return redirect("/welcome");
  }
  const userId = signedInUserId(locals);
  const row = userId ? await signupByUser(userId) : null;
  if (!userId || !row) {
    return redirect("/welcome");
  }
  let answer;
  try {
    answer = await callControl("owner_link", { clerk_user_id: userId, request_id: row.request_id }, TIMEOUT_MS);
  } catch (error) {
    if (!(error instanceof ControlUnreachable)) {
      throw error;
    }
    answer = null;
  }
  console.log(`welcome/open: ${answer?.status ?? "unreachable"}`);
  // A signed 404 is the control site's answer for a request that is not Ready (or not this user's).
  if (answer?.status === 404) {
    return redirect("/welcome");
  }
  const url = answer?.status === 200 ? answer.body.url : null;
  if (typeof url !== "string" || !url.startsWith("https://")) {
    return redirect(RETRY);
  }
  return redirect(url);
};

// A HEAD is a prefetch by definition (AC-4): back to /welcome, no owner link.
export const HEAD: APIRoute = () => redirect("/welcome");
