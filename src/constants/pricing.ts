export interface PricingPlan {
    name: string;
    priceUSD: string;
    priceTZS: string;
    period: string;
    blurb: string;
    features: string[];
    featured: boolean;
}

export const pricingPlans: PricingPlan[] = [
    {
        name: "Starter",
        priceUSD: "$29",
        priceTZS: "75,000",
        period: "/mo",
        blurb: "For freelancers and side projects finding their footing.",
        features: ["Up to 100 transactions/mo", "Auto-categorization", "Live P&L dashboard", "Email support"],
        featured: false,
    },
    {
        name: "Growth",
        priceUSD: "$79",
        priceTZS: "205,000",
        period: "/mo",
        blurb: "For growth-stage startups that need clean, investor-ready books.",
        features: [
            "Unlimited transactions",
            "Real-time reconciliation",
            "Tax-ready reports & exports",
            "Accountant collaboration",
            "Priority support",
        ],
        featured: true,
    },
    {
        name: "Scale",
        priceUSD: "Custom",
        priceTZS: "Custom",
        period: "",
        blurb: "For larger teams with multiple entities and currencies.",
        features: ["Multi-entity consolidation", "Multi-currency", "Dedicated success manager", "API access"],
        featured: false,
    },
];

export function getCurrencySymbol(countryCode: string): string {
    return countryCode === "TZ" ? "TZS " : "$";
}

export function getPrice(plan: PricingPlan, countryCode: string): string {
    if (plan.priceUSD === "Custom") return "Custom";
    return countryCode === "TZ" ? plan.priceTZS : plan.priceUSD.replace("$", "");
}

export function isTanzania(countryCode: string): boolean {
    return countryCode === "TZ";
}