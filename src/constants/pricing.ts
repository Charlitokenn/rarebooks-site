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
  // Spec 0020 AC-9: the pricing page's Everything included list. Every item must stay true of /books (each
  // was checked on the demo shop, AC-11): when a feature goes, remove it here too. `features` above is the
  // short list the plan cards and the homepage teaser read.
  included: [
    {
      title: "Accounting",
      items: [
        "Double entry accounting with your own chart of accounts",
        "Journal entries and opening balances",
        "Accounts in more than one currency",
      ],
    },
    {
      title: "Selling and buying",
      items: [
        "Sales quotes, invoices and payments",
        "Purchase invoices and supplier payments",
        "Expenses, such as rent, wages and transport",
        "Price lists, pricing rules and coupon codes",
        "Loyalty programs",
      ],
    },
    {
      title: "Point of sale",
      items: ["A point of sale for the counter", "Barcode scanner support", "A cashier role for your counter staff"],
    },
    {
      title: "Stock",
      items: ["Stock levels and stock movements", "Batches and serial numbers", "Purchase receipts and shipments"],
    },
    {
      title: "Reports",
      items: [
        "A dashboard with your balances and best sellers",
        "Profit and loss, balance sheet and trial balance",
        "General ledger",
        "Print templates for your invoices",
      ],
    },
    {
      title: "Your team and data",
      items: [
        "Unlimited users and devices",
        "Roles and permissions",
        "An import wizard for your existing records",
        "Export to CSV at any time",
        "Daily backups",
      ],
    },
    { title: "Support", items: ["WhatsApp support", "Step by step guides in our docs"] },
  ] as { title: string; items: string[] }[],
};

// Setup services, sold by hand on top of the plan (not through checkout).
export interface ServiceOffer {
  name: string;
  price: string;
  priceNote: string;
  blurb: string;
  /** May be empty: the card then shows no check list (spec 0020). */
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

// Outside Tanzania (spec 0020 AC-8). The free data import is delivered by hand, for anyone who takes the
// yearly plan during their trial; nothing on the control site tracks it yet.
export const abroadServices: ServiceOffer[] = [
  {
    name: "Free data import",
    price: "Free",
    priceNote: "With the yearly plan, taken during your trial",
    blurb:
      "We import your data from QuickBooks, Sage, Tally or your spreadsheets, so you start with your history in place.",
    features: [],
    cta: "Ask about data import",
  },
];

export function getCurrencySymbol(countryCode: string): string {
  return countryCode === "TZ" ? "TZS " : "$";
}

export function isTanzania(countryCode: string): boolean {
  return countryCode === "TZ";
}
