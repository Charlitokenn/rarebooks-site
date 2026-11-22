// The owner's identity for a sign up, from Clerk on the server, never from the form (spec 0014 AC-1).

import type { APIContext } from "astro";

export interface Owner {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * The signed in user, when their primary email is verified. A blank first name becomes the part of the email
 * before the `@`; a blank last name stays blank.
 */
export async function verifiedOwner(locals: APIContext["locals"]): Promise<Owner | null> {
  const { userId } = locals.auth();
  if (!userId) {
    return null;
  }
  const user = await locals.currentUser();
  if (!user || user.id !== userId) {
    return null;
  }
  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
  if (!primary || primary.verification?.status !== "verified") {
    return null;
  }
  const email = primary.emailAddress.trim();
  return {
    clerkUserId: userId,
    email,
    firstName: (user.firstName || "").trim() || email.split("@")[0],
    lastName: (user.lastName || "").trim(),
  };
}

export function signedInUserId(locals: APIContext["locals"]): string | null {
  return locals.auth().userId ?? null;
}
