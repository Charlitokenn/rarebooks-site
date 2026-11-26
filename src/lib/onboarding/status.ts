// The signed in user's sign up, read once for both `GET /api/onboarding/status` and the /welcome page, so the
// two can't drift (spec 0023 AC-3, from spec 0014 AC-4).
//
// Found by Clerk user id in D1, or, when D1 has no row, by asking the control site with the Clerk user id
// alone, which also writes the missing row. A signed 404 for a D1 row means the row is stale (a released sign
// up, spec 0016 AC-8), so the row is dropped.

import type { APIContext } from "astro";

import { publicAddress } from "./address.ts";
import { ControlUnreachable, callControl } from "./control.ts";
import { earlierSignup } from "./earlier.ts";
import { signedInUserId } from "./owner.ts";
import { deleteSignup, saveSignup, signupByUser } from "./signups.ts";

import type { SignupStatus } from "./address.ts";
export type { SignupStatus };

const STATUSES = new Set<string>(["Queued", "Claiming", "Preparing", "Ready", "Failed"]);

export interface SignupState {
  request_id: string;
  status: SignupStatus;
  step: string | null;
  address: string | null;
}

export type SignupRead =
  | { kind: "signed_out" }
  | { kind: "none" }
  | { kind: "unreachable" }
  | ({ kind: "status" } & SignupState);

export async function readSignupStatus(
  locals: APIContext["locals"],
  timeoutMs?: number,
): Promise<SignupRead> {
  const userId = signedInUserId(locals);
  if (!userId) {
    return { kind: "signed_out" };
  }
  const row = await signupByUser(userId);
  const payload: Record<string, unknown> = { clerk_user_id: userId };
  if (row) {
    payload.request_id = row.request_id;
  }
  let answer;
  try {
    answer = await callControl("signup_status", payload, timeoutMs);
  } catch (error) {
    if (!(error instanceof ControlUnreachable)) {
      throw error;
    }
    console.error("status:", error.message);
    return { kind: "unreachable" };
  }
  if (answer.status === 404) {
    if (row && earlierSignup(answer, row.request_id) === "stale") {
      await deleteSignup(userId, row.request_id);
    }
    return { kind: "none" };
  }
  const { request_id: requestId, status, step, address, email } = answer.body;
  if (answer.status !== 200 || typeof requestId !== "string" || !STATUSES.has(String(status))) {
    return { kind: "unreachable" };
  }
  if (!row && typeof email === "string") {
    await saveSignup(userId, email, requestId);
  }
  return {
    kind: "status",
    request_id: requestId,
    status: status as SignupStatus,
    step: typeof step === "string" && step ? step : null,
    address: publicAddress(status as SignupStatus, address),
  };
}
