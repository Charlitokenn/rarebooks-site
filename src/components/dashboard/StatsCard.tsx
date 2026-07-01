import * as React from "react";
import { CheckCircle2, Monitor, CreditCard } from "lucide-react";
import { Card, CardContent } from "@components/components/ui/card";

interface StatsCardsProps {
    licenseStatus: string;
    devicesActive: string;
    planType: string;
    hasExpiry: boolean;
    daysRemaining: number | null;
}

export function StatsCards({
                               licenseStatus,
                               devicesActive,
                               planType,
                               hasExpiry,
                               daysRemaining,
                           }: StatsCardsProps) {
    const isActive = licenseStatus === "Active";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* License Status */}
            <Card>
                <CardContent className="p-5">
                    <p className="text-sm font-medium text-muted-foreground">
                        License Status
                    </p>
                    <p
                        className={`text-2xl font-bold mt-1 ${
                            isActive ? "text-green-600" : "text-destructive"
                        }`}
                    >
                        {licenseStatus}
                    </p>
                    {hasExpiry && daysRemaining !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {daysRemaining} days left
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Devices Active */}
            <Card>
                <CardContent className="p-5">
                    <p className="text-sm font-medium text-muted-foreground">
                        Devices Active
                    </p>
                    <p className="text-2xl font-bold mt-1 text-primary">{devicesActive}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {(() => {
                            const [active, max] = devicesActive.split("/").map(Number);
                            const remaining = max - active;
                            return `${remaining} slot${remaining !== 1 ? "s" : ""} free`;
                        })()}
                    </p>
                </CardContent>
            </Card>

            {/* Plan Type */}
            <Card>
                <CardContent className="p-5">
                    <p className="text-sm font-medium text-muted-foreground">Plan Type</p>
                    <p className="text-2xl font-bold mt-1">{planType}</p>
                    {hasExpiry ? (
                        <p className="text-xs text-muted-foreground mt-1">Annual billing</p>
                    ) : (
                        <p className="text-xs text-green-600 font-medium mt-1">
                            Lifetime License
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}