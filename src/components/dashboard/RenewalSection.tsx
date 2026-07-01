import * as React from "react";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@components/components/ui/card";
import { Button } from "@components/components/ui/button";
import { Badge } from "@components/components/ui/badge";
import { AppConfig } from "../../constants";
import { isTanzania, type PricingPlan } from "../../constants/pricing";
import { cn } from "../../components/lib/utils";

interface RenewalSectionProps {
    currentPlan: string;
    countryCode: string;
    onSelectPlan: (planId: string) => void;
}

interface PaymentMethod {
    id: string;
    name: string;
    provider: string;
    type: string;
}

export function RenewalSection({
                                   currentPlan,
                                   countryCode,
                                   onSelectPlan,
                               }: RenewalSectionProps) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const isLocal = isTanzania(countryCode);

    useEffect(() => {
        async function fetchMethods() {
            try {
                const response = await fetch("/api/payment-methods");
                const data = await response.json();
                setPaymentMethods(data.methods || []);
            } catch (err) {
                console.error("Failed to fetch payment methods:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMethods();
    }, []);

    // Get plans from constants
    const plans = AppConfig.pricingPlans.filter(
        (p: PricingPlan) => p.name !== "Scale"
    );

    const getPlanId = (name: string) => {
        if (name === "Do It Yourself") return "diy";
        if (name === "Done For You") return "dfy";
        return "";
    };

    const getPlanDisplay = (plan: PricingPlan) => {
        const planId = getPlanId(plan.name);
        const isCurrentPlan = currentPlan === plan.name;

        // For TZ: show only yearly price
        // For non-TZ: show monthly and yearly options
        const priceDisplay = isLocal
            ? `TZS ${plan.priceTZS}`
            : `$${plan.priceUSD.monthly}`;

        const periodDisplay = isLocal ? "/ Year" : "/ Month";

        return (
            <div
                key={plan.name}
                className={cn(
                    "cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                    isCurrentPlan
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                )}
                onClick={() => onSelectPlan(planId)}
            >
                {isCurrentPlan && (
                    <Badge
                        variant="outline"
                        className="mb-2 bg-primary/10 text-primary border-primary/20"
                    >
                        Current Plan
                    </Badge>
                )}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {plan.features[0]} {/* Shows device count feature */}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-primary">{priceDisplay}</p>
                        <p className="text-xs text-muted-foreground">{periodDisplay}</p>
                    </div>
                </div>
            </div>
        );
    };

    // Get icon for payment method
    const getMethodIcon = (methodId: string) => {
        switch (methodId) {
            case "mpesa":
                return "M";
            case "airtel":
                return "A";
            case "halopesa":
                return "H";
            case "tigopesa":
                return "T";
            case "card":
                return "C";
            default:
                return "P";
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">Renew License</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose your plan and payment method
                    </p>
                    <Badge variant="outline" className="mt-2 gap-1">
                        <MapPin className="w-3 h-3" />
                        {isLocal ? "Tanzania" : "International"}
                    </Badge>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                    {plans.map(getPlanDisplay)}
                </div>

                {/* Payment Methods */}
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Available Payment Methods
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center p-3 bg-muted rounded-lg border animate-pulse"
                            >
                                <div className="w-8 h-8 bg-muted-foreground/20 rounded-full mb-1" />
                                <div className="w-12 h-3 bg-muted-foreground/20 rounded" />
                            </div>
                        ))
                        : paymentMethods
                            .filter((m) => {
                                // For TZ, only show TZS methods. For international, show all
                                if (isLocal) return m.currencies?.includes("TZS");
                                return true;
                            })
                            .map((method) => (
                                <div
                                    key={method.id}
                                    className="flex flex-col items-center p-3 bg-muted rounded-lg border hover:bg-muted/80 cursor-pointer transition-colors"
                                >
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary mb-1">
                      {getMethodIcon(method.id)}
                    </span>
                                    <span className="text-xs font-medium text-center">
                      {method.name}
                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                      {method.provider}
                    </span>
                                </div>
                            ))}
                </div>

                <Button className="w-full" onClick={() => onSelectPlan(getPlanId(plans[0]?.name || ""))}>
                    Proceed to Payment
                </Button>
            </CardContent>
        </Card>
    );
}