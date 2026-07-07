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
            <Card className="shadow-none border border-gray-300">
                <CardContent className="p-3">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            License Status
                        </p>
                        <p
                            className={`text-2xl font-bold ${
                                isActive ? "text-green-600" : "text-destructive"
                            }`}
                        >
                            {licenseStatus}
                        </p>
                        {hasExpiry && daysRemaining !== null && (
                            <p className="text-xs text-muted-foreground">
                                {daysRemaining} days left
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Devices Active */}
            <Card className="shadow-none border border-gray-300">
                <CardContent className="p-3">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Devices Active
                        </p>
                        <p className="text-2xl font-bold text-primary">{devicesActive}</p>
                        <p className="text-xs text-muted-foreground">
                            {(() => {
                                const [active, max] = devicesActive.split("/").map(Number);
                                const remaining = max - active;
                                return `${remaining} slot${remaining !== 1 ? "s" : ""} free`;
                            })()}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Plan Type */}
            <Card className="shadow-none border border-gray-300">
                <CardContent className="p-3">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Plan Type</p>
                        <p className="text-2xl font-bold">{planType}</p>
                        {hasExpiry ? (
                            <p className="text-xs text-muted-foreground">Annual billing</p>
                        ) : (
                            <p className="text-xs text-green-600 font-medium">
                                Lifetime License
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}