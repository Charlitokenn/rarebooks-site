// Every string on the homepage, word for word from spec 0019 *Page copy* (AC-3). Change the words in the
// spec first, then here, so the copy and the claims checked in AC-14 stay in step. `{name}` placeholders are
// filled by `fill` in src/lib/marketing/home.ts; `*word*` in a headline is its one MkHighlight word.

export interface HomeFeature {
  overline: string;
  title: string;
  text: string;
  alt: string;
  /** The screenshot name without its `-tzs` or `-usd` set (AC-8). */
  shot: "home-balances" | "home-pos" | "home-stock" | "home-profit";
}

export interface HomeCopy {
  hero: {
    overline: string;
    title: string;
    lead: string;
    primary: string;
    demo: string;
    priceLine: string;
    screenshotAlt: string;
  };
  trust: { title: string };
  features: { overline: string; title: string; rows: HomeFeature[] };
  trial: {
    title: string;
    lead: string;
    steps: { title: string; text: string }[];
    primary: string;
  };
  pricing: {
    title: string;
    price: string;
    period: string;
    /** Abroad only: the monthly price and the yearly saving. */
    note?: string;
    primary: string;
    /** The link under the card to /pricing (spec 0020 AC-14). */
    more: string;
    /** Tanzania only: the quick start line and its button (AC-10). */
    setup?: { text: string; button: string };
  };
  faq: {
    title: string;
    /** Answers are trusted HTML we write; MkFaq renders them with set:html. */
    items: { question: string; answer: string }[];
    /** The button that ends the last answer (AC-11). */
    contact: string;
  };
  cta: { title: string; lead: string; primary: string };
  demoDialog: { label: string; close: string; newTab: string };
}

const hero = {
  overline: "For shops and small businesses",
  primary: "Start free trial",
  demo: "Watch the demo",
  screenshotAlt: "The RareBooks dashboard showing cash and bank balances and the best selling items",
};

const trust = { title: "Trusted by growing businesses" };

const featureRows = (dashboardText: string): HomeFeature[] => [
  {
    overline: "Dashboard",
    title: "Know where you stand every morning",
    text: dashboardText,
    alt: "Account balances and a best sellers chart on the RareBooks dashboard",
    shot: "home-balances",
  },
  {
    overline: "Point of sale",
    title: "Sell fast at the counter",
    text: "Your cashier rings up sales on the point of sale screen, with a barcode scanner if you have one. Every sale takes the items out of stock on its own.",
    alt: "The RareBooks point of sale screen with items in a cart",
    shot: "home-pos",
  },
  {
    overline: "Stock",
    title: "See what's on the shelf without counting",
    text: "Check how much of each item you have at any moment, and plan your next order from real numbers, not guesses.",
    alt: "A stock balance report listing items and quantities on hand",
    shot: "home-stock",
  },
  {
    overline: "Reports",
    title: "Profit you can trust",
    text: "Record expenses as they happen, and your profit and loss is ready whenever you ask. Hand your accountant clean reports at tax time.",
    alt: "A profit and loss report in RareBooks",
    shot: "home-profit",
  },
];

const features = (dashboardText: string) => ({
  overline: "Features",
  title: "Everything your shop runs on",
  rows: featureRows(dashboardText),
});

const startStep = {
  title: "Start free",
  text: "Sign up and your own site at yourname.rarebooks.cc is ready in minutes. Every feature, nothing to pay up front.",
};

const trial = (setUp: string, decide: string) => ({
  title: "Try it free for {freeDays} days",
  lead: "Run your real business on it before you pay anything.",
  steps: [startStep, { title: "Get set up", text: setUp }, { title: "Decide by day {removedOnDay}", text: decide }],
  primary: "Start free trial",
});

const pricing = {
  title: "One plan. Everything included.",
  period: "a year",
  primary: "Start free trial",
  more: "See full pricing",
};

const faq = (payMethod: string, bringRecords: string) => ({
  title: "Questions people ask",
  items: [
    {
      question: "Do I need to install anything?",
      answer:
        "No. Your RareBooks site lives online at yourname.rarebooks.cc. Open it in the browser on your phone, tablet or computer.",
    },
    {
      question: "What happens when the trial ends?",
      answer: `Your first {freeDays} days are free. From day {payFromDay} you can pay to keep going (${payMethod}). From day {readOnlyFromDay} your site is read only until you pay, and if you haven't paid by day {removedOnDay}, we email you all your records as CSV files and remove the site.`,
    },
    { question: "Can I bring my existing records?", answer: bringRecords },
    {
      question: "Is my data safe, and is it mine?",
      answer:
        "Your site is backed up every day. You can export your records as CSV files at any time, and they stay yours whatever you decide.",
    },
    {
      question: "How do I get help?",
      answer:
        'Email us at {supportEmail} or send a message, and read the step by step guides in our <a href="{docsHomePath}">docs</a>.',
    },
  ],
  contact: "Contact us",
});

const cta = {
  title: "Stop dreading your books. Start *trusting* them.",
  lead: "Join businesses that left notebooks and spreadsheets behind for good.",
  primary: "Start free trial",
};

const demoDialog = {
  label: "RareBooks interactive demo",
  close: "Close demo",
  newTab: "Open the demo in a new tab",
};

export const homeCopy: { local: HomeCopy; abroad: HomeCopy } = {
  local: {
    hero: {
      ...hero,
      title: "Your stock and sales, always *current*",
      lead: "RareBooks turns your notebooks into live records: what's on the shelf, what's selling and what you're earning, on your phone or computer.",
      priceLine: "Free for {freeDays} days, then TZS {tzsYear} a year. We can set up your shop for you.",
    },
    trust,
    features: features(
      "See your cash, mobile money and bank balances, and your best selling items, the moment you open RareBooks.",
    ),
    trial: trial(
      "Do it yourself, or let us set up your shop: your items, opening stock and the customers who owe you.",
      "Pay TZS {tzsYear} for the year by mobile money and keep going. If not, we send you all your records as CSV files.",
    ),
    pricing: {
      ...pricing,
      price: "TZS {tzsYear}",
      setup: {
        text: "Want us to set up your shop? Quick start is {quickStart}, and it comes back as 3 free months.",
        button: "Talk to us",
      },
    },
    faq: faq(
      "by mobile money",
      "Yes. Our quick start ({quickStart}) enters your items, opening stock and the customers who owe you. We can also type in your old notebooks; ask us for a price.",
    ),
    cta,
    demoDialog,
  },
  abroad: {
    hero: {
      ...hero,
      title: "Clear books, confident *stock*",
      lead: "RareBooks keeps your accounting, invoicing, point of sale and stock in one place, hosted for you. Know your numbers and stay ready for tax.",
      priceLine: "Free for {freeDays} days, then USD {usdYear} a year or USD {usdMonth} a month.",
    },
    trust,
    features: features(
      "See your cash and bank balances, and your best selling items, the moment you open RareBooks.",
    ),
    trial: trial(
      "Do it yourself, or take the yearly plan during your trial and we import your data from QuickBooks, Sage, Tally or your spreadsheets.",
      "Keep going for USD {usdYear} a year or USD {usdMonth} a month. If not, we send you all your records as CSV files.",
    ),
    pricing: {
      ...pricing,
      price: "USD {usdYear}",
      note: "or USD {usdMonth} a month. Save USD {usdSaving} with yearly.",
    },
    faq: faq(
      "by card or PayPal",
      "Yes. Take the yearly plan during your trial and we import your data from QuickBooks, Sage, Tally or your spreadsheets, free.",
    ),
    cta,
    demoDialog,
  },
};

/** Signed in visitors see this in place of every body "Start free trial" (AC-12). */
export const welcomeLabel = "Open your site";
