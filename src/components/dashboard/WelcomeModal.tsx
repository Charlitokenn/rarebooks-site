"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@components/components/ui/dialog";
import { Button } from "@components/components/ui/button";
import { Mail, KeyRound, Settings, CheckCircle2 } from "lucide-react";

type WelcomeReason = "trial" | "redeem" | null;

/**
 * Shown once, right after a brand-new user is auto-signed-in from either
 * the trial form (/api/license) or the AppSumo redemption form
 * (/api/redemption) — see sign-in-with-ticket.ts. Both flows redirect to
 * `/dashboard?welcome=trial` or `/dashboard?welcome=redeem`, which this
 * component reads once on mount and then strips from the URL.
 */
export function WelcomeModal() {
    const [reason, setReason] = useState<WelcomeReason>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const welcome = params.get("welcome");

        if (welcome === "trial" || welcome === "redeem") {
            setReason(welcome);
            setOpen(true);

            // Strip the query param so a refresh/share link doesn't re-trigger it.
            params.delete("welcome");
            const query = params.toString();
            window.history.replaceState(
                {},
                "",
                window.location.pathname + (query ? `?${query}` : ""),
            );
        }
    }, []);

    if (!reason) return null;

    const isTrial = reason === "trial";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger/>
            <DialogContent>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <DialogTitle className="mt-3 text-center">
                    {isTrial ? "You're all set — welcome!" : "Welcome to RareBooks!"}
                </DialogTitle>
                <DialogDescription className="text-center">
                    {isTrial
                        ? "Your trial license is active and you're signed in to your client portal."
                        : "Your lifetime license is active and you're signed in to your client portal."}
                </DialogDescription>

                <ul className="mt-5 space-y-3">
                    <li className="flex items-start gap-3 text-sm text-ink">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>Your license key has been sent to your email.</span>
                    </li>

                    {isTrial && (
                        <li className="flex items-start gap-3 text-sm text-ink">
                            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                            <span>Your login details have also been sent to your email.</span>
                        </li>
                    )}

                    <li className="flex items-start gap-3 text-sm text-ink">
                        <Settings className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>
              {isTrial
                  ? "You can change your password anytime from the Settings tab in the sidebar."
                  : "You can update your password anytime from the Settings tab in the sidebar."}
            </span>
                    </li>
                </ul>

                <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
                    Got it
                </Button>
            </DialogContent>
        </Dialog>
    );
}