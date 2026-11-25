// Every string inside <main> on /pricing, word for word from spec 0020 *Page copy* (AC-3, AC-17). Change the
// words in the spec first, then here, so the copy and the claims checked in AC-11 stay in step. `{name}`
// placeholders are filled by `fill` with `pricingValues` (src/lib/marketing/pricing.ts); `*word*` in a
// headline is its one MkHighlight word. The closing band is HomeCta with the homepage's own copy.

export type PlanId = "tz" | "yearly" | "monthly";

export interface PlanCopy {
  id: PlanId;
  badge?: string;
  name: string;
  price: string;
  period: string;
  note: string;
  /** The featured card's line above its check list (AC-5). */
  extra?: string;
  primary: string;
}

export interface PricingCopy {
  /** The meta description, the same for every visitor (AC-12). */
  description: string;
  plans: {
    title: string;
    lead: string;
    cards: PlanCopy[];
    /** The line under the cards (AC-6). Each version shows only its own currency. */
    unlimited: string;
  };
  setup: { title: string; lead: string };
  included: { title: string; lead: string };
  faq: {
    title: string;
    /** Answers are trusted HTML we write; MkFaq renders them with set:html. */
    items: { question: string; answer: string }[];
    contact: string;
  };
}

const description =
  "One plan with every feature: TZS {tzsYear} a year in Tanzania, or ${usdMonth} a month or ${usdYear} a year elsewhere. Start with a {freeDays} day free trial, no card needed.";

const plansTitle = "One plan for your whole *shop*";
const unlimited = "Every plan includes unlimited users and devices.";
const primary = "Start free trial";

const included = {
  title: "Everything *included*",
  lead: "Every feature, for every user, on every plan.",
};

const trialFaq = {
  question: "How does the free trial work?",
  answer:
    "Your first {freeDays} days are free, with every feature and no card needed. From day {payFromDay} you can pay to keep going. From day {readOnlyFromDay} your site is read only until you pay. If you haven't paid by day {removedOnDay}, we email you a link to download all your records, then remove the site a few days later.",
};

const perUserFaq = {
  question: "Is there a charge per user or device?",
  answer:
    "No. Add your whole team and use RareBooks on every phone, tablet and computer you have, at no extra cost.",
};

const stopPayingFaq = {
  question: "What happens if I stop paying?",
  answer:
    "When a paid period ends, you keep full access for {graceDays} more days. Then your site is read only, so you can still view and export everything. If you haven't renewed {removedAfterDays} days after that, we email you a link to download all your records, then remove the site a few days later.",
};

const faq = (pay: string, cancel: string) => ({
  title: "Pricing questions",
  items: [
    trialFaq,
    { question: "How do I pay?", answer: pay },
    perUserFaq,
    { question: "Can I cancel?", answer: cancel },
    stopPayingFaq,
  ],
  contact: "Contact us",
});

export const pricingCopy: { local: PricingCopy; abroad: PricingCopy } = {
  local: {
    description,
    plans: {
      title: plansTitle,
      lead: "Try every feature free for {freeDays} days, with no card needed. Then pay once a year by mobile money.",
      cards: [
        {
          id: "tz",
          badge: "The plan",
          name: "RareBooks",
          price: "TZS {tzsYear}",
          period: "a year",
          note: "Pay by mobile money. Nothing renews on its own.",
          primary,
        },
      ],
      unlimited,
    },
    setup: {
      title: "Want us to set it up for you?",
      lead: "Optional, and paid once. Your plan works the same either way.",
    },
    included,
    faq: faq(
      "By mobile money through ClickPesa, one year at a time, from the Subscription page in RareBooks. We email you a receipt for every payment (not a TRA fiscal receipt).",
      "Yes. Nothing renews on its own: you pay for one year at a time and decide again each year. You can export your records as CSV files at any time, even when your site is read only.",
    ),
  },
  abroad: {
    description,
    plans: {
      title: plansTitle,
      lead: "Try every feature free for {freeDays} days, with no card needed. Then pay monthly, or yearly and save ${usdSaving}.",
      cards: [
        {
          id: "yearly",
          badge: "Best value",
          name: "Yearly",
          price: "${usdYear}",
          period: "a year",
          note: "Save ${usdSaving} on paying monthly. Renews each year until you cancel.",
          extra: "Free data import when you take the yearly plan during your trial",
          primary,
        },
        {
          id: "monthly",
          name: "Monthly",
          price: "${usdMonth}",
          period: "a month",
          note: "Billed monthly after your free trial. Renews each month until you cancel.",
          primary,
        },
      ],
      unlimited,
    },
    setup: {
      title: "Bring your records with you",
      lead: "Moving from other software? We do the import for you.",
    },
    included,
    faq: faq(
      "By card or PayPal, monthly or yearly, from the Subscription page in RareBooks. Payments go through PayPal, so we never see your card details. We email you a receipt for every payment.",
      "Yes. Your plan renews until you cancel. Cancel your subscription in PayPal at any time, and you keep full access until the end of the period you paid for. You can export your records as CSV files at any time, even when your site is read only.",
    ),
  },
};
