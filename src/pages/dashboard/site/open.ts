// Opens the signed in user's own site (spec 0014 AC-5): a fresh password set link while they have no password,
// else the site's `/login`. The URL travels only in the `Location` header and is never logged.

import type { APIRoute } from "astro";

import { ControlUnreachable, callControl } from "../../../lib/onboarding/control.ts";
import { signedInUserId } from "../../../lib/onboarding/owner.ts";
import { signupByUser } from "../../../lib/onboarding/signups.ts";

export const prerender = false;

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" },
  });
}

export const GET: APIRoute = async ({ locals }) => {
  const userId = signedInUserId(locals);
  const row = userId ? await signupByUser(userId) : null;
  if (!userId || !row) {
    return redirect("/dashboard");
  }
  let answer;
  try {
    answer = await callControl("owner_link", { clerk_user_id: userId, request_id: row.request_id });
  } catch (error) {
    if (!(error instanceof ControlUnreachable)) {
      throw error;
    }
    answer = null;
  }
  const url = answer?.status === 200 ? answer.body.url : null;
  console.log(`site/open: ${answer?.status ?? "unreachable"}`);
  if (typeof url !== "string" || !url.startsWith("https://")) {
    return redirect("/dashboard");
  }
  return redirect(url);
};
