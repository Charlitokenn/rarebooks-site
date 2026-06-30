/**
 * Signs the current user out of Clerk.
 *
 * This project's React components (NavUser, etc.) are plain React islands
 * — they're not wrapped in a `<ClerkProvider>` from `@clerk/react`, so
 * hooks like `useClerk()` aren't available here. Auth state instead comes
 * from `@clerk/astro`, which loads the Clerk client and exposes it as
 * `window.Clerk` globally in the browser once it's ready (this is the
 * same instance Clerk's own Astro components like `<UserButton />` and
 * `<SignOutButton />` use under the hood).
 *
 * `@clerk/astro` already provides the correct global type for this
 * (`Window.Clerk: BrowserClerk`), so no extra typing is needed here.
 *
 * https://clerk.com/docs/guides/development/custom-flows/authentication/sign-out
 */
export async function signOutUser(redirectUrl: string = "/") {
    if (typeof window === "undefined" || !window.Clerk) {
        // Clerk hasn't finished loading yet (very unlikely on an
        // already-authenticated dashboard page, but guard anyway). There's
        // nothing useful to do client-side here other than bail out —
        // the user can just try again.
        console.warn("[signOutUser] Clerk has not loaded yet; ignoring.");
        return;
    }

    await window.Clerk.signOut({ redirectUrl });
}