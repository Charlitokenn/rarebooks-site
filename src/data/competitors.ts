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
const at = (url: string): Source => ({ url, checkedOn });
const xeroPricing = at("https://www.xero.com/us/pricing-plans/");

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
  // ------------------------------------------------------------- QUICKBOOKS
  // AC-1, checked 2026-11-25: on sale with a 30 day trial, maintained (August 2026 product update), cloud
  // (QuickBooks Online). US list prices.
  {
    slug: "quickbooks",
    name: "QuickBooks Online",
    shortName: "QuickBooks",
    summary: "Intuit's online accounting, with plans from free to Advanced. See how it compares on stock and selling.",
    metaDescription:
      "Compare RareBooks vs QuickBooks: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "Five plans in the US: Free (2 invoices a month), Simple Start at USD 38 a month, Essentials at USD 85, Plus at USD 140 and Advanced at USD 340. Users run from 1 to 25 by plan.",
    rows: {
      price: "Free, then USD 38 to USD 340 a month, by plan (US prices)",
      trial: "30 days",
      pos: "Not built in; QuickBooks points you to Shopify POS",
      stock: "On Plus and Advanced only",
      invoicing: "Invoices on every plan; the Free plan allows 2 a month",
      currency: "On Essentials, Plus and Advanced",
      users: "1 to 25 users, by plan",
      mobileMoney: "Not listed",
      support: "Chat support on every plan",
    },
    sources: {
      pricing: at("https://quickbooks.intuit.com/pricing/"),
      price: at("https://quickbooks.intuit.com/pricing/"),
      trial: at("https://quickbooks.intuit.com/pricing/"),
      pos: at("https://quickbooks.intuit.com/desktop/point-of-sale/"),
      stock: at("https://quickbooks.intuit.com/accounting/inventory/"),
      invoicing: at("https://quickbooks.intuit.com/pricing/"),
      currency: at(
        "https://quickbooks.intuit.com/learn-support/en-us/manage-customers-and-income/about-multi-currency/00/262378",
      ),
      users: at("https://quickbooks.intuit.com/pricing/"),
      mobileMoney: at("https://quickbooks.intuit.com/pricing/"),
      support: at("https://quickbooks.intuit.com/pricing/"),
    },
    bestForCompetitor:
      "Businesses that want a widely used tool, automatic bank matching and plans that grow from a free start to 25 users.",
    bestForRareBooks:
      "Shops and small businesses that sell at a counter and keep stock, and want every feature on one plan for {price}.",
    deepDives: [
      {
        title: "Stock on every plan or the top plans",
        intro: "If you sell goods, when stock tracking arrives in your plan decides what you pay.",
        rarebooks: {
          heading: "RareBooks",
          body: "Stock levels, batches and serial numbers come with the one plan, alongside purchase receipts and shipments.",
        },
        competitor: {
          heading: "QuickBooks",
          body: "Inventory tracking is part of Plus and Advanced, the two higher plans, with reports to follow what you hold.",
        },
      },
      {
        title: "Selling at the counter",
        intro: "If customers pay you in person, how you ring up a sale matters every day.",
        rarebooks: {
          heading: "RareBooks",
          body: "A point of sale is built in, with barcode scanner support and a cashier role for your counter staff.",
        },
        competitor: {
          heading: "QuickBooks",
          body: "QuickBooks has no point of sale of its own for new customers and points you to Shopify POS to sell in person.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose QuickBooks if you want a well known tool with automatic bank matching, a free plan to start on and room to grow to 25 users on Advanced.",
    recommendationRareBooks:
      "Choose RareBooks if you sell from a counter and keep stock: point of sale, stock, invoices and accounting come in one plan, for one price.",
    whenToChooseCompetitor:
      "QuickBooks suits a business that mostly sends invoices, wants its bank transactions matched for it, and is happy to pay more as it needs stock or more users.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they want stock and a point of sale without moving up a plan ladder, with every feature and unlimited users for {price}.",
    migrationSteps: [
      "Export your customers, suppliers, items and closing balances from QuickBooks.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, ring up sales at the point of sale and watch your stock levels.",
    ],
    faqs: [
      {
        q: "Can I keep using QuickBooks while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Do I pay more for stock or more users in RareBooks?",
        a: "No. RareBooks has one plan for {price}, with stock, the point of sale and unlimited users included.",
      },
    ],
  },

  // ------------------------------------------------------------- FRESHBOOKS
  // AC-1, checked 2026-11-25: on sale with a 30 day trial, maintained (feature news updated 2026-07-17),
  // cloud. US list prices.
  {
    slug: "freshbooks",
    name: "FreshBooks",
    shortName: "FreshBooks",
    summary: "Invoicing and accounting built for service businesses. See how it compares if you also sell goods.",
    metaDescription:
      "Compare RareBooks vs FreshBooks: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "Lite at USD 23 a month (5 clients), Plus at USD 43 (50 clients) and Premium at USD 70 (unlimited clients), with Select priced on request. Each team member costs USD 11 a month more.",
    rows: {
      price: "From USD 23 to USD 70 a month, by plan, plus USD 11 a month per team member",
      trial: "30 days",
      pos: "Not listed",
      stock: "Not listed",
      invoicing: "Invoices and estimates on every plan; proposals from Plus; Lite bills up to 5 clients",
      currency: "Not listed on the pricing page",
      users: "Team members cost USD 11 a month each",
      mobileMoney: "Not listed",
      support: "Help center; dedicated phone support on Select",
    },
    sources: {
      pricing: at("https://www.freshbooks.com/pricing"),
      price: at("https://www.freshbooks.com/pricing"),
      trial: at("https://www.freshbooks.com/pricing"),
      pos: at("https://www.freshbooks.com/pricing"),
      stock: at("https://www.freshbooks.com/pricing"),
      invoicing: at("https://www.freshbooks.com/pricing"),
      currency: at("https://www.freshbooks.com/pricing"),
      users: at("https://www.freshbooks.com/pricing"),
      mobileMoney: at("https://www.freshbooks.com/pricing"),
      support: at("https://www.freshbooks.com/pricing"),
    },
    bestForCompetitor:
      "Freelancers and service businesses that bill clients for time and projects and want polished invoices, estimates and proposals.",
    bestForRareBooks:
      "Businesses that sell goods as well as services and want stock, a point of sale and accounting in one plan for {price}.",
    deepDives: [
      {
        title: "Services or goods",
        intro: "What you sell shapes which tool fits: hours and projects, or items on a shelf.",
        rarebooks: {
          heading: "RareBooks",
          body: "Stock levels, batches and serial numbers, purchase receipts and a point of sale sit beside your invoices and books.",
        },
        competitor: {
          heading: "FreshBooks",
          body: "FreshBooks centres on billing clients: invoices, estimates, proposals and retainers, with expenses tracked in real time.",
        },
      },
      {
        title: "Paying for your team",
        intro: "As more people help run the business, the price of adding them adds up.",
        rarebooks: {
          heading: "RareBooks",
          body: "Unlimited users are included, with roles and permissions and a cashier role for counter staff.",
        },
        competitor: {
          heading: "FreshBooks",
          body: "Each team member is USD 11 a month on top of the plan, and Lite and Plus also cap how many clients you can bill.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose FreshBooks if you sell your time and expertise and want strong client billing: estimates, proposals, retainers and online payments.",
    recommendationRareBooks:
      "Choose RareBooks if you also sell goods: stock, the point of sale and accounting come in one plan, with your whole team included.",
    whenToChooseCompetitor:
      "FreshBooks suits a freelancer or service business that bills clients, tracks time and projects, and doesn't hold stock.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they start selling products, need to know what is in stock, or want their whole team in without paying per person, for {price}.",
    migrationSteps: [
      "Export your clients, items and invoice history from FreshBooks.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, add your stock and ring up sales at the point of sale.",
    ],
    faqs: [
      {
        q: "Can I keep using FreshBooks while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Does RareBooks limit how many customers I can invoice?",
        a: "No. You can send quotes and invoices to as many customers as you like, for {price}.",
      },
    ],
  },

  // ------------------------------------------------------------------- WAVE
  // AC-1, checked 2026-11-25: on sale (Starter and Pro), maintained (product post dated 2025-12-08, only just
  // inside 12 months), cloud. The two help center sources were read through a search excerpt; the help center
  // refuses direct requests from the build environment (see verify.md).
  {
    slug: "wave",
    name: "Wave",
    shortName: "Wave",
    summary: "Free invoicing and bookkeeping for very small businesses. See how it compares if you keep stock.",
    metaDescription:
      "Compare RareBooks vs Wave: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "Starter is free. Pro is USD 19 a month or USD 190 a year and adds bank imports and late payment reminders. Card payments carry processing fees.",
    rows: {
      price: "Starter free; Pro USD 19 a month or USD 190 a year",
      trial: "No trial listed; Starter is free",
      pos: "Not listed",
      stock: "Doesn't track stock units; you record stock value by hand",
      invoicing: "Unlimited estimates and invoices, even on Starter",
      currency: "Invoices and bills in a foreign currency",
      users: "Add users with roles; admin, editor and viewer on Pro",
      mobileMoney: "Not listed",
      support: "Live chat and email, weekdays 9 AM to 4:45 PM Eastern",
    },
    sources: {
      pricing: at("https://www.waveapps.com/pricing"),
      price: at("https://www.waveapps.com/pricing"),
      trial: at("https://www.waveapps.com/pricing"),
      pos: at("https://www.waveapps.com/pricing"),
      stock: at("https://support.waveapps.com/hc/en-us/articles/208623546-Track-inventory-in-Wave"),
      invoicing: at("https://www.waveapps.com/pricing"),
      currency: at("https://support.waveapps.com/hc/en-us/articles/360035158192-Foreign-currency-invoices-and-bills"),
      users: at("https://www.waveapps.com/pricing"),
      mobileMoney: at("https://www.waveapps.com/pricing"),
      support: at("https://www.waveapps.com/pricing"),
    },
    bestForCompetitor:
      "Freelancers and very small businesses that want free invoicing and bookkeeping and don't keep stock.",
    bestForRareBooks:
      "Shops and small businesses that sell goods, keep stock and want a point of sale and accounting together for {price}.",
    deepDives: [
      {
        title: "Tracking what's on the shelf",
        intro: "For any business that sells physical goods, knowing what you hold matters.",
        rarebooks: {
          heading: "RareBooks",
          body: "Stock levels and movements, batches and serial numbers update as you buy and sell, with purchase receipts and shipments.",
        },
        competitor: {
          heading: "Wave",
          body: "Wave doesn't count stock units. You can record the value of your stock yourself with journal entries.",
        },
      },
      {
        title: "Free to start, or everything included",
        intro: "What you pay, and what you get for it, shapes which tool fits.",
        rarebooks: {
          heading: "RareBooks",
          body: "One plan for {price}, with the point of sale, stock and unlimited users included.",
        },
        competitor: {
          heading: "Wave",
          body: "Starter costs nothing for unlimited invoices and estimates. Pro, at USD 19 a month, adds bank imports and automatic reminders.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose Wave if you want to invoice and keep your books for free, you sell services, and you don't need to track stock.",
    recommendationRareBooks:
      "Choose RareBooks if you sell goods: stock, batches, a point of sale and accounting come in one app for one price.",
    whenToChooseCompetitor:
      "Wave suits a freelancer or very small business that wants free invoicing and simple bookkeeping and doesn't hold stock.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they start selling goods and need stock counts and a point of sale, all included for {price}.",
    migrationSteps: [
      "Export your customers, products and closing balances from Wave.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, add your stock and ring up sales at the point of sale.",
    ],
    faqs: [
      {
        q: "Can I keep using Wave while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Does RareBooks count my stock for me?",
        a: "Yes. Stock levels, batches and serial numbers update as you buy and sell, all within {price}.",
      },
    ],
  },

  // ------------------------------------------------------------- ZOHO BOOKS
  // AC-1, checked 2026-11-25: on sale with a 14 day trial, maintained (What's new entries dated 2026-09-24),
  // cloud. US list prices, monthly billing.
  {
    slug: "zoho-books",
    name: "Zoho Books",
    shortName: "Zoho",
    summary: "Online accounting from the Zoho suite, with stock from Professional up. See how its plans compare.",
    metaDescription:
      "Compare RareBooks vs Zoho Books: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "Six plans in the US, each per organization: Free, Standard at USD 20 a month, Professional at USD 50, Premium at USD 70, Elite at USD 150 and Ultimate at USD 275. Paying yearly costs less.",
    rows: {
      price: "Free, then USD 20 to USD 275 a month, by plan (US prices)",
      trial: "14 days",
      pos: "A separate product, Zoho POS, that connects to Zoho Books",
      stock: "From Professional up; advanced stock control from Elite",
      invoicing: "Quotes and invoices on every plan",
      currency: "From Professional up",
      users: "1 to 15 users, by plan",
      mobileMoney: "Not listed",
      support: "Email on Free; email, voice and chat on paid plans",
    },
    sources: {
      pricing: at("https://www.zoho.com/us/books/pricing/"),
      price: at("https://www.zoho.com/us/books/pricing/"),
      trial: at("https://www.zoho.com/us/books/pricing/"),
      pos: at("https://www.zoho.com/en-us/pos/"),
      stock: at("https://www.zoho.com/us/books/pricing/"),
      invoicing: at("https://www.zoho.com/us/books/pricing/"),
      currency: at("https://www.zoho.com/us/books/pricing/"),
      users: at("https://www.zoho.com/us/books/pricing/"),
      mobileMoney: at("https://www.zoho.com/us/books/pricing/"),
      support: at("https://www.zoho.com/us/books/pricing/"),
    },
    bestForCompetitor:
      "Businesses that already use other Zoho apps and want accounting that connects to them, with plans that scale to large teams.",
    bestForRareBooks:
      "Shops and small businesses that want stock, a point of sale and accounting in one app on one plan for {price}.",
    deepDives: [
      {
        title: "One app or a suite",
        intro: "Some businesses want everything in one place; others like to pick apps and connect them.",
        rarebooks: {
          heading: "RareBooks",
          body: "The point of sale, stock and accounting are one app, so a sale at the counter updates your stock and books together.",
        },
        competitor: {
          heading: "Zoho",
          body: "Zoho Books handles the accounting, and Zoho POS is a separate product that connects to it for selling in person.",
        },
      },
      {
        title: "Features by plan",
        intro: "What each plan includes decides what you pay as you grow.",
        rarebooks: {
          heading: "RareBooks",
          body: "One plan for {price}, with stock, more than one currency and unlimited users included.",
        },
        competitor: {
          heading: "Zoho",
          body: "Stock and more than one currency start on Professional, users run from 1 to 15 by plan, and advanced stock control comes with Elite.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose Zoho Books if you already work in the Zoho suite, want a free plan to start, or need the larger plans for a growing team.",
    recommendationRareBooks:
      "Choose RareBooks if you want the point of sale, stock and accounting in one app, with every feature on one plan.",
    whenToChooseCompetitor:
      "Zoho Books suits a business that uses other Zoho apps, wants a free start, and is happy to add Zoho POS as a separate product.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they want selling, stock and accounting in a single app, with unlimited users, for {price}.",
    migrationSteps: [
      "Export your contacts, items and closing balances from Zoho Books.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, ring up sales at the point of sale and watch your stock levels.",
    ],
    faqs: [
      {
        q: "Can I keep using Zoho Books while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Is the point of sale a separate product in RareBooks?",
        a: "No. The point of sale is part of RareBooks, included in {price}, so sales update your stock and books together.",
      },
    ],
  },

  // -------------------------------------------------------------- FREEAGENT
  // AC-1, checked 2026-11-25: on sale with a 30 day trial, maintained (Apron integration 2026-11-04), cloud.
  // Its international price in USD.
  {
    slug: "freeagent",
    name: "FreeAgent",
    shortName: "FreeAgent",
    summary: "Online accounting for freelancers and small firms, strong on UK tax. See how it compares on selling goods.",
    metaDescription:
      "Compare RareBooks vs FreeAgent: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "One plan: USD 22 a month or USD 220 a year outside the UK. In the UK, a limited company pays GBP 33 a month, and other business types pay different prices.",
    rows: {
      price: "USD 22 a month or USD 220 a year (international price)",
      trial: "30 days",
      pos: "Not listed",
      stock: "Not listed",
      invoicing: "Estimates and invoices, with automatic reminders",
      currency: "Multi currency invoicing",
      users: "Not stated on the pricing page",
      mobileMoney: "Not listed",
      support: "UK based support accountants, online or by phone",
    },
    sources: {
      pricing: at("https://www.freeagent.com/en/pricing/"),
      price: at("https://www.freeagent.com/en/pricing/"),
      trial: at("https://www.freeagent.com/en/pricing/"),
      pos: at("https://www.freeagent.com/pricing/"),
      stock: at("https://www.freeagent.com/pricing/"),
      invoicing: at("https://www.freeagent.com/pricing/"),
      currency: at("https://www.freeagent.com/en/pricing/"),
      users: at("https://www.freeagent.com/en/pricing/"),
      mobileMoney: at("https://www.freeagent.com/pricing/"),
      support: at("https://www.freeagent.com/pricing/"),
    },
    bestForCompetitor:
      "Freelancers, contractors and small firms, especially in the UK, that want invoicing, time tracking and tax filing in one place.",
    bestForRareBooks:
      "Shops and small businesses that sell goods and want stock, a point of sale and accounting together for {price}.",
    deepDives: [
      {
        title: "Time and tax, or stock and sales",
        intro: "Each tool is shaped around a different kind of business.",
        rarebooks: {
          heading: "RareBooks",
          body: "Built around selling: a point of sale, stock levels, batches and serial numbers, purchase receipts and shipments.",
        },
        competitor: {
          heading: "FreeAgent",
          body: "Built around services: projects, time tracking, payroll and direct filing of VAT and Self Assessment to HMRC.",
        },
      },
      {
        title: "Help when you need it",
        intro: "Good support makes the switch, and the day to day, easier.",
        rarebooks: {
          heading: "RareBooks",
          body: "WhatsApp support and step by step guides in our docs, on the one plan.",
        },
        competitor: {
          heading: "FreeAgent",
          body: "UK based support accountants answer online or over the phone.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose FreeAgent if you're a UK freelancer or small firm that bills for time and wants VAT and Self Assessment filed straight to HMRC.",
    recommendationRareBooks:
      "Choose RareBooks if you sell goods: a point of sale, stock and accounting come in one app for one price.",
    whenToChooseCompetitor:
      "FreeAgent suits a UK based freelancer, contractor or small firm that tracks time and projects and files UK tax returns.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they sell goods and need stock counts and a point of sale, all included for {price}.",
    migrationSteps: [
      "Export your contacts, invoices and closing balances from FreeAgent.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, add your stock and ring up sales at the point of sale.",
    ],
    faqs: [
      {
        q: "Can I keep using FreeAgent while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Can I invoice in more than one currency in RareBooks?",
        a: "Yes. You can keep accounts in more than one currency, all within {price}.",
      },
    ],
  },

  // ----------------------------------------------------------------- RECKON
  // AC-1, checked 2026-11-25: Reckon One on sale with a 30 day trial, maintained (release 2026-11-17), cloud.
  // Australian prices, GST included.
  {
    slug: "reckon",
    name: "Reckon One",
    shortName: "Reckon",
    summary: "Australian online accounting with unlimited users. See how it compares on stock and the point of sale.",
    metaDescription:
      "Compare RareBooks vs Reckon One: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "Three plans in Australia, GST included: Accounting Plus at AUD 27 a month, Accounting Premium at AUD 50 and Ultimate at AUD 92. Payroll is an option.",
    rows: {
      price: "AUD 27 to AUD 92 a month, by plan (Australian prices)",
      trial: "30 days",
      pos: "Reckon's point of sale works with Reckon Accounts desktop, not listed for Reckon One",
      stock: "Not on Accounting Plus; 1 to 10 items on Premium; unlimited on Ultimate",
      invoicing: "Invoicing on every plan",
      currency: "Not listed",
      users: "Unlimited users",
      mobileMoney: "Not listed",
      support: "Phone and chat support",
    },
    sources: {
      pricing: at("https://www.reckon.com/au/pricing/"),
      price: at("https://www.reckon.com/au/pricing/"),
      trial: at("https://www.reckon.com/au/pricing/"),
      pos: at("https://www.reckon.com/au/point-of-sale/"),
      stock: at("https://www.reckon.com/au/pricing/"),
      invoicing: at("https://www.reckon.com/au/pricing/"),
      currency: at("https://www.reckon.com/au/pricing/"),
      users: at("https://www.reckon.com/au/pricing/"),
      mobileMoney: at("https://www.reckon.com/au/pricing/"),
      support: at("https://www.reckon.com/au/pricing/"),
    },
    bestForCompetitor:
      "Australian small businesses that want GST and BAS handled, unlimited users, payroll as an option and phone support.",
    bestForRareBooks:
      "Shops and small businesses that want unlimited stock items and a point of sale on one plan for {price}.",
    deepDives: [
      {
        title: "How much stock you can track",
        intro: "If you sell goods, the number of items your plan allows matters.",
        rarebooks: {
          heading: "RareBooks",
          body: "Stock levels, batches and serial numbers for all your items, with purchase receipts and shipments, on the one plan.",
        },
        competitor: {
          heading: "Reckon",
          body: "Inventory isn't on Accounting Plus, Premium covers 1 to 10 items, and Ultimate tracks unlimited items.",
        },
      },
      {
        title: "Selling at the counter",
        intro: "If customers pay you in person, how you ring up a sale matters every day.",
        rarebooks: {
          heading: "RareBooks",
          body: "A point of sale is built in, with barcode scanner support and a cashier role for your counter staff.",
        },
        competitor: {
          heading: "Reckon",
          body: "Reckon's point of sale is described as working with Reckon Accounts, its desktop product, rather than with Reckon One.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose Reckon One if you're in Australia and want GST and BAS reporting, unlimited users, optional payroll and phone support.",
    recommendationRareBooks:
      "Choose RareBooks if you sell from a counter and keep many stock items: the point of sale and unlimited stock come in one plan.",
    whenToChooseCompetitor:
      "Reckon One suits an Australian business that wants local tax reporting and support, and holds little or no stock.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they need a point of sale and stock for all their items without moving up a plan, for {price}.",
    migrationSteps: [
      "Export your contacts, items and closing balances from Reckon One.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, ring up sales at the point of sale and watch your stock levels.",
    ],
    faqs: [
      {
        q: "Can I keep using Reckon One while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Is there a limit on stock items in RareBooks?",
        a: "No. Stock levels, batches and serial numbers come with the one plan, for {price}.",
      },
    ],
  },

  // ------------------------------------------------------------------- MYOB
  // AC-1, checked 2026-11-25: on sale with a 14 day trial on Pro, maintained (AI BAS beta expanded
  // 2026-09-15), cloud (MYOB Business in the browser). Australian prices.
  {
    slug: "myob",
    name: "MYOB Business",
    shortName: "MYOB",
    summary: "Australian accounting with plans from sole traders to AccountRight. See how it compares on stock and selling.",
    metaDescription:
      "Compare RareBooks vs MYOB: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "Plans in Australia: Solo at AUD 99 a year, Lite at AUD 315 a year, Pro at AUD 70 a month and AccountRight Plus at AUD 165 a month. Unlimited inventory is AUD 22 a month extra on Lite and Pro.",
    rows: {
      price: "AUD 315 a year (Lite) to AUD 165 a month (AccountRight Plus)",
      trial: "14 days on Pro",
      pos: "Not listed",
      stock: "On Lite, Pro and Plus, one location; unlimited inventory AUD 22 a month extra on Lite and Pro",
      invoicing: "Unlimited quotes and invoices",
      currency: "On AccountRight Premier only",
      users: "Unlimited user profiles, except Solo (1)",
      mobileMoney: "Not listed",
      support: "24/7 chat support; priority support on AccountRight Plus",
    },
    sources: {
      pricing: at("https://www.myob.com/au/pricing"),
      price: at("https://www.myob.com/au/pricing"),
      trial: at("https://www.myob.com/au/pricing"),
      pos: at("https://www.myob.com/au/pricing"),
      stock: at("https://www.myob.com/au/pricing"),
      invoicing: at("https://www.myob.com/au/pricing"),
      currency: at("https://www.myob.com/au/pricing"),
      users: at("https://www.myob.com/au/pricing"),
      mobileMoney: at("https://www.myob.com/au/pricing"),
      support: at("https://www.myob.com/au/pricing"),
    },
    bestForCompetitor:
      "Australian businesses that want BAS, payroll and Single Touch Payroll handled, with plans from sole traders up to AccountRight.",
    bestForRareBooks:
      "Shops and small businesses that sell at a counter and want stock and a point of sale on one plan for {price}.",
    deepDives: [
      {
        title: "Selling at the counter",
        intro: "If customers pay you in person, how you ring up a sale matters every day.",
        rarebooks: {
          heading: "RareBooks",
          body: "A point of sale is built in, with barcode scanner support and a cashier role for your counter staff.",
        },
        competitor: {
          heading: "MYOB",
          body: "MYOB's plans list quotes, invoices and online payments, but no point of sale of its own.",
        },
      },
      {
        title: "Stock and currencies by plan",
        intro: "What each plan includes decides what you pay as you grow.",
        rarebooks: {
          heading: "RareBooks",
          body: "Stock with batches and serial numbers, and accounts in more than one currency, come with the one plan for {price}.",
        },
        competitor: {
          heading: "MYOB",
          body: "Inventory starts on Lite in one location, unlimited inventory costs AUD 22 a month more on Lite and Pro, and more than one currency needs AccountRight Premier.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose MYOB if you're in Australia and want BAS, payroll and Single Touch Payroll handled, with 24/7 chat support and room to move up to AccountRight.",
    recommendationRareBooks:
      "Choose RareBooks if you sell from a counter: the point of sale, stock and more than one currency come in one plan.",
    whenToChooseCompetitor:
      "MYOB suits an Australian business that runs payroll, files BAS and wants a plan ladder from sole trader to AccountRight.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they want a point of sale, stock and more than one currency without moving up a plan, for {price}.",
    migrationSteps: [
      "Export your contacts, items and closing balances from MYOB.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, ring up sales at the point of sale and watch your stock levels.",
    ],
    faqs: [
      {
        q: "Can I keep using MYOB while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Does RareBooks charge extra for stock?",
        a: "No. Stock levels, batches and serial numbers come with the one plan, for {price}.",
      },
    ],
  },

  // --------------------------------------------------------------- MANAGER
  // AC-1, checked 2026-11-25: Cloud Edition on sale with a 14 day trial, maintained (26.5.15, May 2026),
  // cloud ("Your books run in the browser"). The free Desktop Edition doesn't count for (c).
  {
    slug: "manager-io",
    name: "Manager",
    shortName: "Manager",
    summary: "Accounting with a free desktop edition and a paid Cloud Edition. See how the cloud version compares.",
    metaDescription:
      "Compare RareBooks vs Manager: price, features and fit for small businesses, and which one suits how you work.",
    pricingCompetitor:
      "The Cloud Edition is USD 59 a month, with unlimited users and businesses and no discounts. The Desktop Edition is free to install on one computer.",
    rows: {
      price: "Cloud Edition USD 59 a month",
      trial: "14 days, no card needed",
      pos: "Not listed",
      stock: "Inventory items, transfers and write offs",
      invoicing: "Sales quotes and invoices",
      currency: "Foreign currencies supported",
      users: "Unlimited users and businesses",
      mobileMoney: "Not listed",
      support: "Community forum and email",
    },
    sources: {
      pricing: at("https://www.manager.cloud/"),
      price: at("https://www.manager.cloud/"),
      trial: at("https://www.manager.cloud/"),
      pos: at("https://www.manager.io/guides/"),
      stock: at("https://www.manager.io/guides/"),
      invoicing: at("https://www.manager.io/guides/"),
      currency: at("https://www.manager.io/guides/foreign-currencies"),
      users: at("https://www.manager.cloud/"),
      mobileMoney: at("https://www.manager.io/guides/"),
      support: at("https://www.manager.cloud/"),
    },
    bestForCompetitor:
      "Businesses and accountants that want unlimited businesses on one subscription, or a free desktop edition for one computer.",
    bestForRareBooks:
      "Shops and small businesses that sell at a counter and want a point of sale with stock and accounting for {price}.",
    deepDives: [
      {
        title: "Selling at the counter",
        intro: "If customers pay you in person, how you ring up a sale matters every day.",
        rarebooks: {
          heading: "RareBooks",
          body: "A point of sale is built in, with barcode scanner support and a cashier role for your counter staff.",
        },
        competitor: {
          heading: "Manager",
          body: "Manager's guides cover quotes, invoices, inventory and production orders, and list no point of sale.",
        },
      },
      {
        title: "Help when you need it",
        intro: "Good support makes the switch, and the day to day, easier.",
        rarebooks: {
          heading: "RareBooks",
          body: "WhatsApp support and step by step guides in our docs, on the one plan.",
        },
        competitor: {
          heading: "Manager",
          body: "Detailed guides, a community forum and email support for the Cloud Edition.",
        },
      },
    ],
    recommendationCompetitor:
      "Choose Manager if you run several businesses on one subscription, or want a free desktop edition for a single computer.",
    recommendationRareBooks:
      "Choose RareBooks if you sell from a counter: the point of sale, stock and accounting come in one app, with WhatsApp support.",
    whenToChooseCompetitor:
      "Manager suits an accountant or owner with several businesses who wants one flat price, and doesn't need a point of sale.",
    whySwitchToRareBooks:
      "Businesses move to RareBooks when they want a point of sale with barcode scanning and WhatsApp support, for {price}.",
    migrationSteps: [
      "Export your customers, suppliers, items and closing balances from Manager.",
      "Start your free trial and set up your company and chart of accounts in RareBooks.",
      "Bring in your customers, suppliers and items with the import wizard, then enter your opening balances.",
      "Start selling: send quotes and invoices, ring up sales at the point of sale and watch your stock levels.",
    ],
    faqs: [
      {
        q: "Can I keep using Manager while I try RareBooks?",
        a: "Yes. The trial is free for {freeDays} days with no card needed, so you can run both side by side before you decide.",
      },
      {
        q: "Is there a point of sale in RareBooks?",
        a: "Yes. A point of sale with barcode scanner support is included in {price}.",
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
