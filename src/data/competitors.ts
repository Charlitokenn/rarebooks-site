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
export const competitors: CompetitorEntry[] = [];

export function getCompetitor(slug: string): CompetitorEntry | undefined {
  return competitors.find((entry) => entry.slug === slug);
}

/** The index order (AC-14): by name, ignoring case. */
export function sortedCompetitors(list: CompetitorEntry[] = competitors): CompetitorEntry[] {
  return [...list].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}
