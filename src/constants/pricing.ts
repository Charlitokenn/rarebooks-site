// The hosted plan is the one plan the control site sells: one price per
// provider and period (Books Plan, rarebooks_control). Keep these figures in
// step with the live Books Plan rows, or the Subscription page and this site
// show different prices.
export const hostedPlan = {
  name: "RareBooks",
  priceTZS: { yearly: "300,000" },
  priceUSD: { monthly: "39", yearly: "399", yearlySaving: "69" },
  features: [
    "Double entry accounting",
    "Invoicing and payments",
    "Inventory and stock levels",
    "Point of sale",
    "Barcode scanner support",
    "Use it on all your devices",
    "Daily backups",
    "WhatsApp support and documentation",
  ],
};

// Setup services, sold by hand on top of the plan (not through checkout).
export interface ServiceOffer {
  name: string;
  price: string;
  priceNote: string;
  blurb: string;
  features: string[];
  cta: string;
}

// Tanzania. The digitization package is shown first as the anchor; the
// quick start fee comes back as 3 extra months on the yearly plan.
export const localServices: ServiceOffer[] = [
  {
    name: "Digitize your notebooks",
    price: "Ask us",
    priceNote: "Priced by how many records you have, with the yearly plan",
    blurb:
      "We type your past notebooks into RareBooks, so your books start complete and correct.",
    features: [
      "Past sales, purchases and expenses",
      "Who owes you and who you owe",
      "Stock matched to a stock count",
      "Your first month end report reviewed with you",
      "Any balance that doesn't match your notebook fixed free for 30 days",
      "Your quick start fee counts toward it",
    ],
    cta: "Ask about digitization",
  },
  {
    name: "Quick start",
    price: "TZS 75,000",
    priceNote: "Comes back as 3 free months",
    blurb:
      "We set up your shop for you, so you're selling on RareBooks by day 3.",
    features: [
      "Your items and prices entered",
      "Your opening stock entered",
      "Customers who owe you, with their balances",
      "Your cashier set up",
      "A call on day 3 for your first sales, and one on day 14",
      "Record sales on 15 of your first 21 days and share a WhatsApp status: we add 3 months to your yearly plan",
    ],
    cta: "Get a quick start",
  },
];

export function getCurrencySymbol(countryCode: string): string {
  return countryCode === "TZ" ? "TZS " : "$";
}

export function isTanzania(countryCode: string): boolean {
  return countryCode === "TZ";
}
