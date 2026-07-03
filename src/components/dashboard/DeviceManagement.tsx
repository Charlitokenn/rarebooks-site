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
        <Tabs defaultValue="devices" className="mt-8">
            <TabsList>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="renew">Renew License</TabsTrigger>
            </TabsList>

            {/* Devices */}
            <TabsContent value="devices" className="mt-4">
                <Card className="shadow-none border-gray-300">
                    <CardHeader>
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <CardTitle>Activated devices</CardTitle>
                                <CardDescription className="mt-1">
                                    Remove a device to free a slot for a new install.
                                </CardDescription>
                            </div>
                            <div className="min-w-[220px]">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Device Slots</span>
                                    <span>{remaining} remaining</span>
                                </div>
                                <Progress value={usagePercent} className="h-2" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {devices.length === 0 ? (
                            <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
                                No devices activated yet.
                            </div>
                        ) : (
                            <div className="rounded-md border-gray-300">
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
                                                            <p className="truncate text-sm font-medium">{name}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden text-sm sm:table-cell">{os}</TableCell>
                                                <TableCell className="hidden text-sm sm:table-cell">
                                                    {ram}
                                                </TableCell>
                                                <TableCell className="hidden text-sm sm:table-cell">
                                                    {manufacturer}
                                                </TableCell>
                                                <TableCell className="hidden text-sm sm:table-cell">
                                                    {device.ipAddress}
                                                </TableCell>
                                                <TableCell className="hidden text-sm sm:table-cell">
                                                    {formatDate(device.activationTime)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deactivateDevice(device.hostId)}
                                                        className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive"
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
            <TabsContent value="renew" className="mt-4">
                <div className="h-6">Coming Soon</div>
            </TabsContent>
        </Tabs>
    );
}