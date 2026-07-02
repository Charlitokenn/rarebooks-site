import * as React from "react";
import { Monitor, Smartphone, Laptop } from "lucide-react";
import { Card, CardContent } from "@components/components/ui/card";
import { Button } from "@components/components/ui/button";
import { Progress } from "@components/components/ui/progress";
import type { Device } from "./LicenseDashboard";

interface DeviceManagementProps {
    devices: Device[];
    maxActivations: number;
    parseDeviceTag: (tag: string) => {
        name: string;
        os: string;
        ram: string;
        manufacturer: string;
    };
}

function getDeviceIcon(os: string) {
    const osLower = os.toLowerCase();
    if (osLower.includes("mac") || osLower.includes("ios")) {
        return <Laptop className="w-5 h-5" />;
    }
    if (osLower.includes("android") || osLower.includes("mobile")) {
        return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
}

export function DeviceManagement({
                                     devices,
                                     maxActivations,
                                     parseDeviceTag,
                                 }: DeviceManagementProps) {
    const activations = devices.length;
    const remaining = maxActivations - activations;
    const usagePercent = maxActivations > 0 ? (activations / maxActivations) * 100 : 0;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold">Device Activations</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage devices where your license is active
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold">{activations}</span>
                        <span className="text-muted-foreground"> / {maxActivations} devices</span>
                    </div>
                </div>

                {/* Usage Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Device Slots</span>
                        <span>{remaining} remaining</span>
                    </div>
                    <Progress value={usagePercent} className="h-2.5 bg-brand" />
                </div>

                {/* Device List */}
                <div className="space-y-3">
                    {devices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No active devices</p>
                            <p className="text-sm mt-1">
                                All slots are free for new activations
                            </p>
                        </div>
                    ) : (
                        devices.map((device) => {
                            const { name, os, ram, manufacturer } = parseDeviceTag(
                                device.deviceTag
                            );
                            return (
                                <div
                                    key={device.id}
                                    className="flex items-center justify-between p-4 rounded-lg border transition-all hover:bg-muted/80 hover:translate-x-1"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-background rounded-lg border flex items-center justify-center shadow-sm">
                                            {getDeviceIcon(os)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{name}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                                                <span>{os}</span>
                                                <span>•</span>
                                                <span>{ram}</span>
                                                <span>•</span>
                                                <span>{manufacturer}</span>
                                                <span>•</span>
                                                <span>IP: {device.ipAddress}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                Activated: {formatDate(device.activationTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Info Banner */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <span className="font-semibold">{remaining}</span> slot
                        {remaining !== 1 ? "s" : ""} available. Open your RareBooks app and
                        enter your license key to activate a new device.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}