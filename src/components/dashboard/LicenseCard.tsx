import * as React from "react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent } from "@components/components/ui/card";
import { Button } from "@components/components/ui/button";
import { Badge } from "@components/components/ui/badge";
import type { LicenseData, CustomerData } from "./LicenseDashboard";

interface LicenseCardProps {
    license: LicenseData;
    customer: CustomerData;
    planName: string;
    hasExpiry: boolean;
    daysRemaining: number | null;
    lifetimePercent: number | null;
}

export function LicenseCard({
                                license,
                                customer,
                                planName,
                                hasExpiry,
                                daysRemaining,
                                lifetimePercent,
                            }: LicenseCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyKey = async () => {
        try {
            await navigator.clipboard.writeText(license.key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Never";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    // Determine progress bar color based on percentage
    const getProgressColor = () => {
        if (!lifetimePercent) return "bg-gray-400";
        if (lifetimePercent > 50) return "bg-green-500";
        if (lifetimePercent > 25) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">License Details</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your active license key
                        </p>
                    </div>
                    <Badge
                        variant={license.activated ? "default" : "destructive"}
                        className={
                            license.activated
                                ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                : ""
                        }
                    >
                        {license.activated ? (
                            <span className="flex items-center gap-1">
                <Check className="w-3 h-3" /> Active
              </span>
                        ) : (
                            "Inactive"
                        )}
                    </Badge>
                </div>

                <div className="space-y-4">
                    {/* License Key */}
                    <div className="bg-muted rounded-lg p-4 border">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            License Key
                        </label>
                        <div className="mt-1 flex items-center gap-3">
                            <code className="text-lg font-mono font-semibold tracking-wider">
                                {license.key}
                            </code>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleCopyKey}
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* License Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-4 border">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Plan
                            </label>
                            <p className="mt-1 text-base font-semibold">{planName}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 border">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Expiry Date
                            </label>
                            <p className="mt-1 text-base font-semibold">
                                {hasExpiry ? formatDate(license.expirationDate) : "Lifetime"}
                            </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Days Remaining
                            </label>
                            <p className="mt-1 text-2xl font-bold text-orange-600">
                                {hasExpiry ? (
                                    <>
                                        {daysRemaining}{" "}
                                        <span className="text-sm font-normal text-muted-foreground">
                      days
                    </span>
                                    </>
                                ) : (
                                    <span className="text-green-600">Unlimited</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* License Lifetime Progress Bar - only for licenses with expiry */}
                    {hasExpiry && lifetimePercent !== null && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>License Lifetime</span>
                                <span>{lifetimePercent}% remaining</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
                                    style={{ width: `${lifetimePercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}