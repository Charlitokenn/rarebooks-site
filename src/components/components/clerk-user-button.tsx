import * as React from "react";
import { useEffect, useRef } from "react";

/**
 * Mounts Clerk's actual <UserButton /> widget inside a plain React tree.
 *
 * This project doesn't wrap its React islands in a <ClerkProvider> (see
 * sign-out.ts) — auth comes from `@clerk/astro`, which exposes the loaded
 * Clerk client as `window.Clerk` globally. That instance has
 * `mountUserButton` / `unmountUserButton` methods for exactly this case:
 * embedding Clerk's prebuilt widgets outside of `@clerk/clerk-react`.
 * https://clerk.com/docs/references/javascript/clerk#mount-user-button
 */
export function ClerkUserButton() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        let cancelled = false;
        let pollId: ReturnType<typeof setInterval> | undefined;

        function mount() {
            if (cancelled || !window.Clerk || !node) return;
            window.Clerk.mountUserButton(node, {
                appearance: {
                    elements: {
                        userButtonAvatarBox: "size-8",
                    },
                },
            });
        }

        if (window.Clerk) {
            // Already loaded (common on a dashboard page — the user is already
            // authenticated, so Clerk finished loading before this hydrated).
            mount();
        } else {
            // Not guaranteed to be ready on first paint — poll briefly until
            // @clerk/astro finishes loading the client.
            pollId = setInterval(() => {
                if (window.Clerk) {
                    clearInterval(pollId);
                    mount();
                }
            }, 100);
        }

        return () => {
            cancelled = true;
            if (pollId) clearInterval(pollId);
            if (node && window.Clerk) {
                window.Clerk.unmountUserButton(node);
            }
        };
    }, []);

    return <div ref={containerRef} />;
}