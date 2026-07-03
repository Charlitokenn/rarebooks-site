import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
    KeyRound,
    Calendar,
    Clock,
    Monitor,
    Smartphone,
    Laptop,
    Trash2,
    Copy,
    Check,
    Shield,
    CreditCard,
    Globe,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "License Portal — Manage Your License" },
            {
                name: "description",
                content:
                    "View your license key, expiry, activated devices, and renew via M-Pesa, Airtel Money, HaloPesa, Yas, card, or PayPal.",
            },
        ],
    }),
    component: Index,
});

type Device = {
    id: string;
    name: string;
    os: string;
    type: "desktop" | "laptop" | "mobile";
    lastSeen: string;
    ip: string;
};

const LICENSE = {
    key: "KM-PRO-9F4A-7C21-B8E0-D5A3",
    plan: "Pro Annual",
    status: "Active",
    issuedAt: "2025-07-12",
    expiresAt: "2026-07-12",
    deviceLimit: 5,
};

const INITIAL_DEVICES: Device[] = [
    {
        id: "d1",
        name: "MacBook Pro 14\"",
        os: "macOS 14.5",
        type: "laptop",
        lastSeen: "2 minutes ago",
        ip: "41.59.xx.xx",
    },
    {
        id: "d2",
        name: "Office Workstation",
        os: "Windows 11 Pro",
        type: "desktop",
        lastSeen: "3 hours ago",
        ip: "196.44.xx.xx",
    },
    {
        id: "d3",
        name: "Dell XPS 15",
        os: "Ubuntu 24.04",
        type: "laptop",
        lastSeen: "Yesterday",
        ip: "102.220.xx.xx",
    },
    {
        id: "d4",
        name: "Studio iMac",
        os: "macOS 13.6",
        type: "desktop",
        lastSeen: "5 days ago",
        ip: "41.59.xx.xx",
    },
];

function daysUntil(dateStr: string) {
    const ms = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
}

function Index() {
    const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
    const [copied, setCopied] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<Device | null>(null);
    const [region, setRegion] = useState<"TZ" | "INTL">("TZ");

    const daysLeft = useMemo(() => daysUntil(LICENSE.expiresAt), []);
    const totalDays = 365;
    const usedPct = ((totalDays - daysLeft) / totalDays) * 100;
    const slotsUsed = devices.length;
    const slotsPct = (slotsUsed / LICENSE.deviceLimit) * 100;

    const copyKey = async () => {
        await navigator.clipboard.writeText(LICENSE.key);
        setCopied(true);
        toast.success("License key copied to clipboard");
        setTimeout(() => setCopied(false), 1800);
    };

    const confirmRemove = () => {
        if (!removeTarget) return;
        setDevices((d) => d.filter((x) => x.id !== removeTarget.id));
        toast.success(`${removeTarget.name} deactivated`, {
            description: "A license slot has been freed.",
        });
        setRemoveTarget(null);
    };

    const expiryTone =
        daysLeft <= 14
            ? "text-destructive"
            : daysLeft <= 45
                ? "text-amber-600 dark:text-amber-500"
                : "text-emerald-600 dark:text-emerald-500";

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="border-b bg-background">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold leading-tight">License Portal</h1>
                            <p className="text-xs text-muted-foreground">Client dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium leading-tight">Amani Mwangi</p>
                            <p className="text-xs text-muted-foreground">amani@example.co.tz</p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                            AM
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                {/* Top summary cards */}
                <section className="grid gap-4 md:grid-cols-3">
                    {/* License key */}
                    <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardDescription className="flex items-center gap-1.5">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Your license key
                                    </CardDescription>
                                    <CardTitle className="mt-1 text-lg">{LICENSE.plan}</CardTitle>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                                    {LICENSE.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <code className="flex-1 truncate rounded-md border bg-muted px-3 py-2.5 font-mono text-sm tracking-wide">
                                    {LICENSE.key}
                                </code>
                                <Button variant="outline" onClick={copyKey} className="shrink-0">
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" /> Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" /> Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Issued</p>
                                    <p className="font-medium">
                                        {new Date(LICENSE.issuedAt).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Expires</p>
                                    <p className="font-medium">
                                        {new Date(LICENSE.expiresAt).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expiry */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Time remaining
                            </CardDescription>
                            <CardTitle className={`mt-1 text-3xl font-bold ${expiryTone}`}>
                                {daysLeft} <span className="text-base font-medium">days</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Progress value={usedPct} className="h-2" />
                            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Renews on{" "}
                                {new Date(LICENSE.expiresAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Tabs */}
                <Tabs defaultValue="devices" className="mt-8">
                    <TabsList>
                        <TabsTrigger value="devices">Devices</TabsTrigger>
                        <TabsTrigger value="renew">Renew</TabsTrigger>
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
                                            <span className="font-medium">
                        {slotsUsed} / {LICENSE.deviceLimit}
                      </span>
                                        </div>
                                        <Progress value={slotsPct} className="h-2" />
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
                                                    <TableHead className="hidden md:table-cell">Last seen</TableHead>
                                                    <TableHead className="hidden lg:table-cell">IP</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {devices.map((d) => (
                                                    <TableRow key={d.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                                                                    {d.type === "laptop" ? (
                                                                        <Laptop className="h-4 w-4" />
                                                                    ) : d.type === "mobile" ? (
                                                                        <Smartphone className="h-4 w-4" />
                                                                    ) : (
                                                                        <Monitor className="h-4 w-4" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-medium">{d.name}</p>
                                                                    <p className="text-xs text-muted-foreground sm:hidden">
                                                                        {d.os}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden text-sm sm:table-cell">{d.os}</TableCell>
                                                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                                            {d.lastSeen}
                                                        </TableCell>
                                                        <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                                                            {d.ip}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setRemoveTarget(d)}
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="hidden sm:inline">Deactivate</span>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Renew */}
                    <TabsContent value="renew" className="mt-4">
                        <RenewSection region={region} setRegion={setRegion} />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Remove device dialog */}
            <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate this device?</DialogTitle>
                        <DialogDescription>
                            {removeTarget?.name} will be signed out of the app on its next launch. You can
                            re-activate it later by signing in again.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmRemove}>
                            <Trash2 className="h-4 w-4" /> Deactivate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* ---------------- Renew ---------------- */

const PLANS = [
    { id: "monthly", label: "Monthly", price_tzs: 25_000, price_usd: 10, badge: null as string | null },
    { id: "annual", label: "Annual", price_tzs: 250_000, price_usd: 99, badge: "Save 17%" },
    { id: "biennial", label: "2 Years", price_tzs: 450_000, price_usd: 179, badge: "Best value" },
];

function RenewSection({
                          region,
                          setRegion,
                      }: {
    region: "TZ" | "INTL";
    setRegion: (r: "TZ" | "INTL") => void;
}) {
    const [plan, setPlan] = useState("annual");
    const [method, setMethod] = useState<string>(region === "TZ" ? "mpesa" : "card");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const selected = PLANS.find((p) => p.id === plan)!;

    const onSwitchRegion = (r: "TZ" | "INTL") => {
        setRegion(r);
        setMethod(r === "TZ" ? "mpesa" : "card");
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            toast.success("Renewal request submitted", {
                description:
                    method === "paypal"
                        ? "Check your email for PayPal payment instructions."
                        : method === "card"
                            ? "You will be redirected to complete card payment."
                            : "Check your phone to authorize the payment.",
            });
        }, 900);
    };

    const tzMethods = [
        { id: "mpesa", label: "M-Pesa", sub: "Vodacom" },
        { id: "airtel", label: "Airtel Money", sub: "Airtel" },
        { id: "halopesa", label: "HaloPesa", sub: "Halotel" },
        { id: "yas", label: "Mixx by Yas", sub: "Yas (Tigo)" },
        { id: "card", label: "Card", sub: "Visa / Mastercard" },
    ];
    const intlMethods = [
        { id: "card", label: "Card", sub: "Visa / Mastercard / Amex" },
        { id: "paypal", label: "PayPal", sub: "Transfer to our PayPal" },
    ];
    const methods = region === "TZ" ? tzMethods : intlMethods;

    return (
        <div className="grid gap-4 lg:grid-cols-3">
            {/* Form */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Renew your license
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Choose a plan and pay with your preferred method.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <Select value={region} onValueChange={(v) => onSwitchRegion(v as "TZ" | "INTL")}>
                                <SelectTrigger className="h-8 w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TZ">Tanzania</SelectItem>
                                    <SelectItem value="INTL">International</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        {/* Plans */}
                        <div>
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                Plan
                            </Label>
                            <RadioGroup
                                value={plan}
                                onValueChange={setPlan}
                                className="mt-2 grid gap-2 sm:grid-cols-3"
                            >
                                {PLANS.map((p) => (
                                    <label
                                        key={p.id}
                                        htmlFor={`plan-${p.id}`}
                                        className={`relative cursor-pointer rounded-lg border p-3 transition-colors ${
                                            plan === p.id
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-muted-foreground/40"
                                        }`}
                                    >
                                        <RadioGroupItem id={`plan-${p.id}`} value={p.id} className="sr-only" />
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{p.label}</p>
                                            {p.badge && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {p.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-lg font-bold">
                                            {region === "TZ"
                                                ? `TZS ${p.price_tzs.toLocaleString()}`
                                                : `$${p.price_usd}`}
                                        </p>
                                    </label>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Methods */}
                        <div>
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                Payment method
                            </Label>
                            <RadioGroup
                                value={method}
                                onValueChange={setMethod}
                                className="mt-2 grid gap-2 sm:grid-cols-2"
                            >
                                {methods.map((m) => (
                                    <label
                                        key={m.id}
                                        htmlFor={`m-${m.id}`}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                            method === m.id
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-muted-foreground/40"
                                        }`}
                                    >
                                        <RadioGroupItem id={`m-${m.id}`} value={m.id} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{m.label}</p>
                                            <p className="text-xs text-muted-foreground">{m.sub}</p>
                                        </div>
                                        {(m.id === "card" || m.id === "paypal") && (
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </label>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Conditional fields */}
                        {region === "TZ" && method !== "card" && (
                            <div>
                                <Label htmlFor="phone">Mobile number</Label>
                                <Input
                                    id="phone"
                                    inputMode="tel"
                                    placeholder="+255 7XX XXX XXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1.5"
                                    required
                                />
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    You'll receive a push prompt to approve payment.
                                </p>
                            </div>
                        )}

                        {method === "paypal" && (
                            <div className="rounded-md border bg-muted/50 p-3 text-sm">
                                <p className="font-medium">PayPal transfer instructions</p>
                                <p className="mt-1 text-muted-foreground">
                                    After confirming, we'll email you our PayPal address and a unique reference. Your
                                    license will renew once payment is received.
                                </p>
                            </div>
                        )}

                        <Separator />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">
                                    {region === "TZ"
                                        ? `TZS ${selected.price_tzs.toLocaleString()}`
                                        : `$${selected.price_usd}`}
                                </p>
                            </div>
                            <Button type="submit" disabled={submitting} size="lg">
                                {submitting ? "Processing..." : "Renew now"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <Row label="Plan" value={selected.label} />
                    <Row label="Current expiry" value={new Date(LICENSE.expiresAt).toLocaleDateString()} />
                    <Row
                        label="New expiry"
                        value={new Date(
                            new Date(LICENSE.expiresAt).getTime() +
                            (selected.id === "monthly" ? 30 : selected.id === "annual" ? 365 : 730) *
                            86_400_000,
                        ).toLocaleDateString()}
                    />
                    <Row label="Region" value={region === "TZ" ? "Tanzania" : "International"} />
                    <Separator />
                    <Row
                        label="Subtotal"
                        value={
                            region === "TZ"
                                ? `TZS ${selected.price_tzs.toLocaleString()}`
                                : `$${selected.price_usd}`
                        }
                    />
                    <Row label="Tax" value="Included" muted />
                    <div className="flex items-center justify-between pt-1">
                        <span className="font-medium">Total</span>
                        <span className="text-lg font-bold">
              {region === "TZ"
                  ? `TZS ${selected.price_tzs.toLocaleString()}`
                  : `$${selected.price_usd}`}
            </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={muted ? "text-muted-foreground" : "font-medium"}>{value}</span>
        </div>
    );
}
