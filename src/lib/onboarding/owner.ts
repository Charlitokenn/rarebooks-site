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
  return ownerOf(userId, await locals.currentUser());
}

type ClerkUser = Awaited<ReturnType<APIContext["locals"]["currentUser"]>>;

/** `verifiedOwner` for a user already read, so a page calls `currentUser()` once (spec 0023 AC-11). */
export function ownerOf(userId: string, user: ClerkUser): Owner | null {
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
    firstName: displayName(user),
    lastName: (user.lastName || "").trim(),
  };
}

/** The Clerk first name, else the part of the primary email before the `@` (spec 0023 AC-5). */
export function displayName(user: ClerkUser): string {
  if (!user) {
    return "";
  }
  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
  const email = (primary?.emailAddress || "").trim();
  return (user.firstName || "").trim() || email.split("@")[0];
}

export function signedInUserId(locals: APIContext["locals"]): string | null {
  return locals.auth().userId ?? null;
}
