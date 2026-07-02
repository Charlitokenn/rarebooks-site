/**
 * Signs a user in automatically using a Clerk sign-in token ("ticket"),
 * minted server-side right after account provisioning (see /api/license
 * and /api/redemption). This lets us log a brand-new user straight into
 * /dashboard without ever exposing a password to client-side JS.
 *
 * Same rationale as sign-out.ts: this project's React islands aren't
 * wrapped in a <ClerkProvider>, so hooks like useSignIn() aren't
 * available. Auth state comes from `@clerk/astro`, which exposes the
 * loaded Clerk instance as `window.Clerk` in the browser.
 *
 * https://clerk.com/docs/guides/development/custom-flows/authentication/embedded-email-links
 */
export async function signInWithTicket(
    ticket: string | null | undefined,
    redirectUrl: string = "/dashboard",
) {
    if (!ticket) {
        // No token (e.g. sign-in-token creation failed server-side) — fall
        // back to a normal manual sign-in instead of leaving the user stuck.
        window.location.href = "/auth/sign-in";
        return;
    }

    if (typeof window === "undefined") {
        return;
    }

    if (!window.Clerk) {
        console.warn("[signInWithTicket] Clerk has not loaded yet; retrying shortly.");
        // Clerk usually finishes loading well before a form's fetch() resolves,
        // but guard for the rare case it hasn't.
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!window.Clerk) {
        window.location.href = "/auth/sign-in";
        return;
    }

    await window.Clerk.load();

    try {
        const signInAttempt = await window.Clerk.client.signIn.create({
            strategy: "ticket",
            ticket,
        });

        if (signInAttempt.status === "complete") {
            await window.Clerk.setActive({
                session: signInAttempt.createdSessionId,
                navigate: async ({ decorateUrl }) => {
                    window.location.href = decorateUrl(redirectUrl);
                },
            });
            return;
        }

        console.error("[signInWithTicket] Sign-in not complete:", signInAttempt);
    } catch (err) {
        console.error("[signInWithTicket] Ticket sign-in failed:", err);
    }

    // Ticket was expired/already used/invalid — send them to sign in manually.
    window.location.href = "/auth/sign-in";
}