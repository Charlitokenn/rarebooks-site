// The address a sign up shows (spec 0023 AC-7, AC-8). Pure, so it is unit tested.

export type SignupStatus = "Queued" | "Claiming" | "Preparing" | "Ready" | "Failed";

/**
 * The control site's address, passed through for every status but Failed (AC-8, which amends spec 0014 AC-4).
 * A Failed sign up never shows it (AC-7), whatever the answer holds.
 */
export function publicAddress(status: SignupStatus, address: unknown): string | null {
  return status !== "Failed" && typeof address === "string" && address.startsWith("https://") ? address : null;
}
