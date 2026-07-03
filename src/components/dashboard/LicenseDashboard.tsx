import * as React from "react";
import { useState, useEffect } from "react";
import { StatsCards } from "./StatsCard";
import { LicenseCard } from "./LicenseCard";
import { DeviceManagement } from "./DeviceManagement";
import { RenewalSection } from "./RenewalSection";
import { SupportCard } from "./SupportCard";
import { PaymentModal } from "./PaymentModal";
import { AppConfig } from "../../constants";

export interface Device {
    id: string;
    hostId: string;
    deviceTag: string;
    ipAddress: string;
    activationTime: string;
}

export interface LicenseData {
    id: string;
    key: string;
    productId: string;
    maxActivations: number;
    activations: number;
    devices: Device[];
    activated: boolean;
    expirationDate: string | null;
    allowedHosts: string[];
}

export interface CustomerData {
    id: string;
    name: string;
    email: string;
    active: boolean;
}

export interface LicenseInfo {
    data: {
        license: LicenseData;
        customer: CustomerData;
    };
    code: number;
}

interface LicenseDashboardProps {
    userEmail: string;
    userName?: string | null;
    countryCode?: string;
}

export function LicenseDashboard({
                                     userEmail,
                                     userName,
                                     countryCode = "US",
                                 }: LicenseDashboardProps) {
    const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch license info on mount and when refreshKey changes
    useEffect(() => {
        async function fetchLicense() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/license-info`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch license information");
                }

                const data: LicenseInfo = await response.json();

                if (data.code !== 0 || !data.data?.license) {
                    // No license found - this is OK for new users
                    setLicenseInfo(null);
                    setLoading(false);
                    return;
                }

                setLicenseInfo(data);
            } catch (err: any) {
                console.error("Error fetching license:", err);
                setError(err.message || "Failed to load license data");
            } finally {
                setLoading(false);
            }
        }

        if (userEmail) {
            fetchLicense();
        }
    }, [userEmail, refreshKey]);

    const handleRefresh = () => setRefreshKey((k) => k + 1);

    const handlePaymentClick = (planId: string) => {
        setSelectedPlan(planId);
        setShowPaymentModal(true);
    };

    // Parse device tag to extract device info
    const parseDeviceTag = (deviceTag: string) => {
        // Format: "MANUFACTURER MODEL (OS, RAM) | Device Name"
        const parts = deviceTag.split(" | ");
        const name = parts[1] || "Unknown Device";
        const infoPart = parts[0] || "";

        // Extract OS and RAM from parentheses
        const osMatch = infoPart.match(/\(([^,]+),\s*([^)]+)\)/);
        const os = osMatch ? osMatch[1].trim() : "Unknown OS";
        const ram = osMatch ? osMatch[2].trim() : "";

        // Extract manufacturer and model
        const beforeParens = infoPart.split("(")[0].trim();
        const manufacturer = beforeParens.split(" ")[0] || "Unknown";

        return { name, os, ram, manufacturer };
    };

    // Determine plan name from license metadata or default
    const getPlanName = () => {
        if (!licenseInfo) return "Trial";
        const plan = licenseInfo.data.license;
        // Map maxActivations to plan names
        if (plan.maxActivations <= 2) return "Do It Yourself";
        if (plan.maxActivations <= 5) return "Done For You";
        return "Scale";
    };

    // Check if license has expiry
    const hasExpiry = licenseInfo?.data.license.expirationDate !== null;

    // Calculate days remaining
    const getDaysRemaining = () => {
        if (!licenseInfo?.data.license.expirationDate) return null;
        const expiry = new Date(licenseInfo.data.license.expirationDate);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    // Calculate license lifetime percentage
    const getLicenseLifetimePercent = () => {
        if (!licenseInfo?.data.license.expirationDate) return null;
        const expiry = new Date(licenseInfo.data.license.expirationDate);
        const now = new Date();
        // Assume license started ~365 days before expiry for yearly
        const start = new Date(expiry);
        start.setFullYear(start.getFullYear() - 1);
        const totalMs = expiry.getTime() - start.getTime();
        const elapsedMs = now.getTime() - start.getTime();
        const percent = Math.max(0, Math.min(100, 100 - (elapsedMs / totalMs) * 100));
        return Math.round(percent);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-4">
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    {error}
                    <button
                        onClick={handleRefresh}
                        className="ml-2 underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <StatsCards
                licenseStatus={
                    licenseInfo?.data.license.activated ? "Active" : "Inactive"
                }
                devicesActive={
                    licenseInfo
                        ? `${licenseInfo.data.license.activations}/${licenseInfo.data.license.maxActivations}`
                        : "0/0"
                }
                planType={getPlanName()}
                hasExpiry={hasExpiry}
                daysRemaining={getDaysRemaining()}
            />

            {/* License Card */}
            {licenseInfo && (
                <LicenseCard
                    license={licenseInfo.data.license}
                    customer={licenseInfo.data.customer}
                    planName={getPlanName()}
                    hasExpiry={hasExpiry}
                    daysRemaining={getDaysRemaining()}
                    lifetimePercent={getLicenseLifetimePercent()}
                />
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Device Management */}
                {licenseInfo && (
                    <DeviceManagement
                        devices={licenseInfo.data.license.devices}
                        maxActivations={licenseInfo.data.license.maxActivations}
                        parseDeviceTag={parseDeviceTag}
                    />
                )}

                {/* Right Column */}
                {/*<div className="space-y-6">*/}
                {/*    /!* Renewal Section - only show if license has expiry *!/*/}
                {/*    {licenseInfo && hasExpiry && (*/}
                {/*        <RenewalSection*/}
                {/*            currentPlan={getPlanName()}*/}
                {/*            countryCode={countryCode}*/}
                {/*            onSelectPlan={handlePaymentClick}*/}
                {/*        />*/}
                {/*    )}*/}

                {/*    /!* Support Card *!/*/}
                {/*    <SupportCard />*/}
                {/*</div>*/}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    planId={selectedPlan}
                    userEmail={userEmail}
                    userName={userName}
                    countryCode={countryCode}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handleRefresh}
                />
            )}
        </div>
    );
}