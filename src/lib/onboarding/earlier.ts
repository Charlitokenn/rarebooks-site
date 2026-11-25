// Whether the D1 row the Worker holds for a user still names a live request on the control site (spec 0016
// AC-8, AC-9). The D1 `signups` table is a cache of the control site: only a signed, verified 404 proves the
// row stale. `callControl` already throws for an unsigned or unechoed answer, so the caller passes null then.

import type { ControlAnswer } from "./control.ts";

export type EarlierSignup = "live" | "stale" | "unknown";

export function earlierSignup(
  answer: Pick<ControlAnswer, "status" | "body"> | null,
  requestId: string,
): EarlierSignup {
  if (!answer) {
    return "unknown";
  }
  if (answer.status === 404) {
    return "stale";
  }
  // The control site answers 200 only for the row's own request (spec 0014 AC-4); anything else is not proof.
  if (answer.status === 200 && answer.body.request_id === requestId) {
    return "live";
  }
  return "unknown";
}
