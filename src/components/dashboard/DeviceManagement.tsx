import * as React from "react";
import {Monitor, Smartphone, Laptop, Trash2} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@components/components/ui/card";
import { Button } from "@components/components/ui/button";
import { Progress } from "@components/components/ui/progress";
import type { Device } from "./LicenseDashboard";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@components/components/ui/table.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@components/components/ui/tabs.tsx";

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

    const deactivateDevice = async (hostId: string) => {

        const response = await fetch("/api/deactivate-key", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(hostId),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to send enquiry");
        }
    }

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
                    <Progress value={usagePercent} className="h-2.5" />
                </div>

                {/* Device List */}
                <Tabs defaultValue="devices" className="mt-8">
                    <TabsList>
                        <TabsTrigger value="devices">Devices</TabsTrigger>
                        <TabsTrigger value="renew">Renew License</TabsTrigger>
                    </TabsList>

                    {/* Devices */}
                    <TabsContent value="devices" className="mt-4">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap items-end justify-between gap-4">
                                    <div>
                                        <CardTitle>Activated devices</CardTitle>
                                        <CardDescription className="mt-1">
                                            Remove a device to free a slot for a new install.
                                        </CardDescription>
                                    </div>
                                    <div className="min-w-[220px]">
                                        <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Slots used
                      </span>
                                            <span className="font-medium"></span>
                                        </div>
                                        <Progress value={0} className="h-2" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {devices.length === 0 ? (
                                    <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
                                        No devices activated yet.
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Device</TableHead>
                                                    <TableHead className="hidden sm:table-cell">OS</TableHead>
                                                    <TableHead className="hidden md:table-cell">RAM</TableHead>
                                                    <TableHead className="hidden lg:table-cell">Manufacturer</TableHead>
                                                    <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                                                    <TableHead className="hidden lg:table-cell">Activated</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {devices.map((device) => {
                                                    const { name, os, ram, manufacturer } = parseDeviceTag(
                                                        device.deviceTag
                                                    );
                                                   return <TableRow key={device.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                                                                    <Monitor className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-medium">{name}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden text-sm sm:table-cell">{os}</TableCell>
                                                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                                            {ram}
                                                        </TableCell>
                                                        <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                                                            {manufacturer}
                                                        </TableCell>
                                                       <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                                                           {device.ipAddress}
                                                       </TableCell>
                                                       <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                                                           {device.activationTime}
                                                       </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deactivateDevice(device.hostId)}
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="hidden sm:inline">Deactivate</span>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Renew */}
                    <TabsContent value="renew" className="mt-4"></TabsContent>
                </Tabs>

                {/*<div className="space-y-3">*/}
                {/*    {devices.length === 0 ? (*/}
                {/*        <div className="text-center py-8 text-muted-foreground">*/}
                {/*            <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />*/}
                {/*            <p>No active devices</p>*/}
                {/*            <p className="text-sm mt-1">*/}
                {/*                All slots are free for new activations*/}
                {/*            </p>*/}
                {/*        </div>*/}
                {/*    ) : (*/}
                {/*        devices.map((device) => {*/}
                {/*            const { name, os, ram, manufacturer } = parseDeviceTag(*/}
                {/*                device.deviceTag*/}
                {/*            );*/}
                {/*            return (*/}
                {/*                <div*/}
                {/*                    key={device.id}*/}
                {/*                    className="flex items-center justify-between p-4 rounded-lg border transition-all hover:bg-muted/80 hover:translate-x-1"*/}
                {/*                >*/}
                {/*                    <div className="flex items-center gap-4">*/}
                {/*                        <div className="w-10 h-10 bg-background rounded-lg border flex items-center justify-center shadow-sm">*/}
                {/*                            {getDeviceIcon(os)}*/}
                {/*                        </div>*/}
                {/*                        <div>*/}
                {/*                            <h3 className="font-medium">{name}</h3>*/}
                {/*                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">*/}
                {/*                                <span>{os}</span>*/}
                {/*                                <span>•</span>*/}
                {/*                                <span>{ram}</span>*/}
                {/*                                <span>•</span>*/}
                {/*                                <span>{manufacturer}</span>*/}
                {/*                                <span>•</span>*/}
                {/*                                <span>IP: {device.ipAddress}</span>*/}
                {/*                            </div>*/}
                {/*                            <p className="text-xs text-muted-foreground/70 mt-1">*/}
                {/*                                Activated: {formatDate(device.activationTime)}*/}
                {/*                            </p>*/}
                {/*                        </div>*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*            );*/}
                {/*        })*/}
                {/*    )}*/}
                {/*</div>*/}

                {/*/!* Info Banner *!/*/}
                {/*<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">*/}
                {/*    <p className="text-sm text-blue-800 dark:text-blue-200">*/}
                {/*        <span className="font-semibold">{remaining}</span> slot*/}
                {/*        {remaining !== 1 ? "s" : ""} available. Open your RareBooks app and*/}
                {/*        enter your license key to activate a new device.*/}
                {/*    </p>*/}
                {/*</div>*/}
            </CardContent>
        </Card>
    );
}