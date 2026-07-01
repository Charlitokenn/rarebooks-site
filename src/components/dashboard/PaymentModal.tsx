import * as React from "react";
import { useState, useEffect } from "react";
import { X, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@components/components/ui/button";
import { Input } from "@components/components/ui/input";
import { Label } from "@components/components/ui/label";
import { Badge } from "@components/components/ui/badge";
import { AppConfig } from "../../constants";
import { isTanzania } from "../../constants/pricing";
import { cn } from "../../components/lib/utils";

interface PaymentModalProps {
    planId: string;
    userEmail: string;
    userName?: string | null;
    countryCode: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface PaymentMethod {
    id: string;
    name: string;
    provider: string;
    type: string;
}

export function PaymentModal({
                                 planId,
                                 userEmail,
                                 userName,
                                 countryCode,
                                 onClose,
                                 onSuccess,
                             }: PaymentModalProps) {
    const [selectedPayment, setSelectedPayment] = useState<string>("card");
    const [mobileNumber, setMobileNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
    const isLocal = isTanzania(countryCode);

    // Get plan details
    const planConfig = AppConfig.pricingPlans.find((p: any) => {
        if (planId === "diy") return p.name === "Do It Yourself";
        if (planId === "dfy") return p.name === "Done For You";
        return false;
    });

    const planName = planConfig?.name || "Selected Plan";
    const maxDevices = planId === "diy" ? 2 : 5;

    // Calculate price
    const getPrice = () => {
        if (!planConfig) return "Custom";
        if (isLocal) {
            return `TZS ${planConfig.priceTZS}`;
        }
        return billingCycle === "monthly"
            ? `$${planConfig.priceUSD.monthly}`
            : `$${planConfig.priceUSD.yearly}`;
    };

    const getPeriod = () => {
        if (isLocal) return "/ Year";
        return billingCycle === "monthly" ? "/ Month" : "/ Year";
    };

    useEffect(() => {
        async function fetchMethods() {
            try {
                const response = await fetch("/api/payment-methods");
                const data = await response.json();
                setPaymentMethods(data.methods || []);
            } catch (err) {
                console.error("Failed to load payment methods:", err);
            }
        }
        fetchMethods();
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Here you would integrate with ClickPesa to process the payment
            // For now, we'll create the license after successful payment
            const response = await fetch("/api/create-license", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    firstName: userName?.split(" ")[0] || "User",
                    lastName: userName?.split(" ").slice(1).join(" ") || "",
                    plan: planId,
                    billingCycle: isLocal ? "yearly" : billingCycle,
                    mobile: mobileNumber,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                alert(data.message || "Payment processing failed");
            }
        } catch (err: any) {
            alert("Payment failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredMethods = paymentMethods.filter((m) => {
        if (isLocal) return m.currencies?.includes("TZS");
        return true;
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Complete Payment</h3>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="bg-muted rounded-lg p-4 border">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Plan</span>
                            <span className="text-sm font-medium">{planName}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Devices</span>
                            <span className="text-sm font-medium">{maxDevices}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Period</span>
                            <span className="text-sm font-medium">
                {isLocal ? "1 Year" : billingCycle === "monthly" ? "1 Month" : "1 Year"}
              </span>
                        </div>
                        {/* Billing cycle toggle for non-local */}
                        {!isLocal && (
                            <div className="flex gap-2 mt-2 mb-2">
                                <Button
                                    size="sm"
                                    variant={billingCycle === "monthly" ? "default" : "outline"}
                                    onClick={() => setBillingCycle("monthly")}
                                    className="flex-1"
                                >
                                    Monthly
                                </Button>
                                <Button
                                    size="sm"
                                    variant={billingCycle === "yearly" ? "default" : "outline"}
                                    onClick={() => setBillingCycle("yearly")}
                                    className="flex-1"
                                >
                                    Yearly
                                </Button>
                            </div>
                        )}
                        <div className="border-t pt-2 mt-2 flex justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-lg text-primary">
                {getPrice()}
                                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                                    {getPeriod()}
                </span>
              </span>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Select Payment Method</h4>
                        <div className="space-y-2">
                            {filteredMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                                        selectedPayment === method.id
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/30"
                                    )}
                                >
                  <span className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    {method.type === "card" ? (
                        <CreditCard className="w-5 h-5" />
                    ) : (
                        <Smartphone className="w-5 h-5" />
                    )}
                  </span>
                                    <div className="text-left">
                                        <p className="font-medium">{method.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {method.provider}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div>
                        {selectedPayment === "card" ? (
                            <div className="space-y-4">
                                <div>
                                    <Label>Card Number</Label>
                                    <Input placeholder="4242 4242 4242 4242" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Expiry</Label>
                                        <Input placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <Label>CVC</Label>
                                        <Input placeholder="123" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Label>Mobile Number</Label>
                                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    +255
                  </span>
                                    <Input
                                        className="pl-14"
                                        placeholder="7XX XXX XXX"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    You will receive a prompt on your phone to enter your PIN
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  Processing...
                </span>
                            ) : (
                                `Pay ${getPrice()}`
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}