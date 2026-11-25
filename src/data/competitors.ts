// The one list behind every comparison page (spec 0021): /compare/[slug], /alternatives/[slug], both index
// grids and the redirects. A competitor stays here only while it passes the AC-1 rule (on sale, maintained,
// has a cloud version), checked and recorded in the spec's verify.md. Every competitor fact carries its
// source (AC-4); every RareBooks claim comes from the templates below (AC-5).
import { AppConfig } from "../constants/index.ts";
import { fill, homeValues } from "../lib/marketing/home.ts";

export type RowKey =
  | "price"
  | "trial"
  | "pos"
  | "stock"
  | "invoicing"
  | "currency"
  | "users"
  | "mobileMoney"
  | "support";

/** AC-3: the nine rows, in this order, and no others. */
export const rowOrder: RowKey[] = [
  "price",
  "trial",
  "pos",
  "stock",
  "invoicing",
  "currency",
  "users",
  "mobileMoney",
  "support",
];

export const rowLabels: Record<RowKey, string> = {
  price: "Price",
  trial: "Free trial",
  pos: "Point of sale",
  stock: "Stock and batches",
  invoicing: "Invoices and quotes",
  currency: "More than one currency",
  users: "Users included",
  mobileMoney: "Mobile money accounts",
  support: "Support",
};

/** AC-4: a page on the vendor's own site, and the day it was read. */
export interface Source {
  /** An `https://` URL on the vendor's site (or its announcement, for a product status). */
  url: string;
  /** `YYYY-MM-DD`, never in the future. */
  checkedOn: string;
}

export interface DualCard {
  heading: string;
  body: string;
}

export interface DeepDive {
  title: string;
  intro: string;
  /** RareBooks prose: may use `{price}` and the trial placeholders. */
  rarebooks: DualCard;
  competitor: DualCard;
}

/** Plain text, never HTML: the answer is escaped before MkFaq renders it. */
export interface Faq {
  q: string;
  a: string;
}

export interface CompetitorEntry {
  /** Unique, kebab case, the URL part. */
  slug: string;
  name: string;
  shortName: string;
  /** 120 characters or fewer, no price (AC-14, AC-7). */
  summary: string;
  /** 160 characters or fewer, no price (AC-7). */
  metaDescription: string;
  /** The competitor's prices, in their own currency. */
  pricingCompetitor: string;
  /** The competitor's cell in each row (AC-3). */
  rows: Record<RowKey, string>;
  sources: Record<RowKey | "pricing", Source>;
  bestForCompetitor: string;
  bestForRareBooks: string;
  deepDives: [DeepDive, DeepDive];
  recommendationCompetitor: string;
  recommendationRareBooks: string;
  whenToChooseCompetitor: string;
  whySwitchToRareBooks: string;
  migrationSteps: [string, string, string, string];
  faqs: [Faq, Faq];
}

// The RareBooks cell of each row (spec 0021, RareBooks row templates). Each claim is in
// `hostedPlan.included` or checked on the demo shop (AC-5); when a feature goes from /books, change it here.
// The price placeholders are allowed only in these two templates (AC-6).
const priceLocal = "TZS {tzsYear} a year, everything included";
const priceAbroad = "USD {usdMonth} a month or USD {usdYear} a year, everything included";
const sharedRows: Omit<Record<RowKey, string>, "price"> = {
  trial: "{freeDays} days, no card needed",
  pos: "Included, with barcode scanner support",
  stock: "Stock levels, batches and serial numbers",
  invoicing: "Quotes, invoices, payments and print templates",
  currency: "Yes, accounts in more than one currency",
  users: "Unlimited users and devices",
  mobileMoney: "Yes, each wallet as its own account",
  support: "WhatsApp support and step by step guides",
};

/** The `{price}` text RareBooks prose may use: the visitor's own currency (AC-6). */
const priceProseLocal = "TZS {tzsYear} a year";
const priceProseAbroad = "USD {usdMonth} a month or USD {usdYear} a year";

/** Every placeholder RareBooks text may use, for the visitor's version: `homeValues` plus `{price}`. */
export function rareBooksValues(local: boolean): Record<string, string | number> {
  const values = homeValues(AppConfig);
  return { ...values, price: fill(local ? priceProseLocal : priceProseAbroad, values) };
}

/** The RareBooks cell of each row, filled for a visitor in Tanzania (`local`) or anywhere else. */
export function rareBooksRowsFor(local: boolean): Record<RowKey, string> {
  const values = rareBooksValues(local);
  const templates: Record<RowKey, string> = { price: local ? priceLocal : priceAbroad, ...sharedRows };
  return Object.fromEntries(rowOrder.map((key) => [key, fill(templates[key], values)])) as Record<
    RowKey,
    string
  >;
}

/** RareBooks prose filled for the visitor; an unknown `{placeholder}` throws rather than showing braces. */
export function fillRareBooks(text: string, local: boolean): string {
  return fill(text, rareBooksValues(local));
}

// Researched and written one entry at a time (build plan steps 1 and 4), each with every source.
const checkedOn = "2026-11-25";
const xeroPricing = { url: "https://www.xero.com/us/pricing-plans/", checkedOn };

export const competitors: CompetitorEntry[] = [
  // ------------------------------------------------------------------- XERO
  // AC-1, checked 2026-11-25: on sale (US plans sold on the pricing page), maintained (product update dated
  // 2026-11-17 on blog.xero.com), cloud (online accounting software). Prices are Xero's US list prices.
  {
    slug: "xero",
    name: "Xero",
    shortName: "Xero",
    summary: "Online accounting with a large app store. See how it compares on price, point of sale and stock.",
    metaDescription:
      "Compare RareBooks vs Xero: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "Three plans in the US: Early at USD 27 a month (20 invoices and 5 bills), Growing at USD 59 a month and Established at USD 97 a month. Prices differ by country.",
    rows: {
      price: "From USD 27 to USD 97 a month, by plan (US prices)",
      trial: "No free trial in the US; 30 days, no card needed, in some countries such as South Africa",
      pos: "Through partner apps such as Lightspeed, not built in",
      stock: "Quantity and value of up to 4,000 tracked items; Inventory Plus is an optional add on",
      invoicing: "Quotes and invoices; the Early plan allows 20 invoices and 5 bills",
      currency: "On the Established plan only",
      users: "No per user fees",
      mobileMoney: "Not listed; bank feeds bring in transactions from your bank",
      support: "Unlimited online support; Xero can call you back, with no inbound phone line",
    },
    sources: {
      pricing: xeroPricing,
      price: xeroPricing,
      trial: { url: "https://www.xero.com/za/signup/", checkedOn },
      pos: { url: "https://apps.xero.com/us/function/point-of-sale", checkedOn },
      stock: { url: "https://www.xero.com/us/accounting-software/manage-inventory/", checkedOn },
      invoicing: xeroPricing,
      currency: xeroPricing,
      users: xeroPricing,
      mobileMoney: { url: "https://www.xero.com/us/accounting-software/reconcile-bank-transactions/", checkedOn },
      support: { url: "https://www.xero.com/us/support/", checkedOn },
    },
    bestForCompetitor:
      "Businesses that want bank feeds, detailed reports and forecasts, and hundreds of connected apps from the Xero App Store.",
    bestForRareBooks:
      "Shops and small businesses that sell at a counter, keep stock and want accounting, point of sale and stock in one app for {price}.",
    deepDives: [
      {
        title: "Selling at the counter",
        intro: "If customers pay you in person, how you ring up a sale matters every day.",
        rarebooks: {
          heading: "RareBooks",
          body: "A point of sale is built in, with barcode scanner support and a cashier role for your counter staff. Each sale updates your stock and your books at once.",
        },
        competitor: {
          heading: "Xero",
          body: "Xero has no point of sale of its own. You pick a partner app, such as Lightspeed Retail, and connect it to Xero to send your sales across.",
        },
      },
      {
        title: "One price or a plan ladder",
        intro: "What you pay, and what you get for it, shapes which tool fits as you grow.",
        rarebooks: {
          heading: "RareBooks",
          body: "One plan for {price}, with every feature and unlimited users included, so nothing is locked behind a higher tier.",
        },
        competitor: {
          heading: "Xero",
          body: "Three plans. Early limits you to 20 invoices and 5 bills, and more than one currency comes only with Established, the top plan, with no per user fees on any of them.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose Xero if you want automatic bank feeds, cash flow forecasts and a large app store to build your setup from, and you don't need a point of sale built in.",
    recommendationRareBooks:
      "Choose RareBooks if you sell from a counter and keep stock: point of sale, batches and serial numbers, invoices and accounting come in one app, for one price.",
    whenToChooseCompetitor:
      "Xero suits a business that works mostly through invoices and bank transfers, wants bank feeds to bring in transactions, and likes to add features through connected apps.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they want to sell at the counter and track stock without paying for and connecting separate apps, with every feature included for {price}.",
    migrationSteps: [
      "Export your customers, suppliers, items and closing balances from Xero.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, ring up sales at the point of sale and watch your stock levels.",
    ],
    faqs: [
      {
        q: "Can I keep using Xero while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Does RareBooks charge per user?",
        a: "No. RareBooks costs {price}, with every feature and unlimited users included.",
      },
    ],
  },
];

export function getCompetitor(slug: string): CompetitorEntry | undefined {
  return competitors.find((entry) => entry.slug === slug);
}

/** The index order (AC-14): by name, ignoring case. */
export function sortedCompetitors(list: CompetitorEntry[] = competitors): CompetitorEntry[] {
  return [...list].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}
