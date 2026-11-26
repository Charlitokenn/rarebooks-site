// The /welcome checklist (spec 0023 AC-5, AC-7): which of the four steps is current for a sign up, and the
// state each step shows. Pure, so the mapping is unit tested.

import { welcomeSteps } from "../../constants/welcome.ts";
import type { SignupStatus } from "./address.ts";

export type StepState = "Done" | "In progress" | "Waiting" | "Failed";

export interface ChecklistStep {
  title: (typeof welcomeSteps)[number];
  state: StepState;
  current: boolean;
}

/**
 * The index of the current step. Queued or Claiming: Getting your site. Preparing: Setting up your address
 * at step `Domain`, else Making your account (no step or an unknown one too). Failed: the step it stopped at,
 * from the server's `step` (`Owner`, `Domain`, or none for Getting your site).
 */
export function currentStep(status: SignupStatus, step: string | null): number {
  if (status === "Failed") {
    if (!step) return 1;
    return step === "Domain" ? 3 : 2;
  }
  if (status === "Preparing") {
    return step === "Domain" ? 3 : 2;
  }
  return 1;
}

/** The four steps with their states. Steps before the current one are done, steps after it wait. */
export function checklist(status: SignupStatus, step: string | null): ChecklistStep[] {
  const current = currentStep(status, step);
  return welcomeSteps.map((title, index) => {
    let state: StepState = "Waiting";
    if (index < current) state = "Done";
    else if (index === current) state = status === "Failed" ? "Failed" : "In progress";
    return { title, state, current: index === current };
  });
}
