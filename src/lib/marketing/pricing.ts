// The /pricing page's helpers (spec 0020). `pricingView` decides everything the page shows from the visitor's
// country and sign in state, so node tests cover it without rendering Astro. Relative imports with their
// `.ts` extension only (no path aliases), so `node --test` runs this file as it is.
import { AppConfig } from "../../constants/index.ts";
import { welcomeLabel, homeCopy, type HomeCopy } from "../../constants/home.ts";
import { welcomePath } from "../../constants/welcome.ts";
import { isTanzania, type ServiceOffer } from "../../constants/pricing.ts";
import { pricingCopy, type PlanId, type PricingCopy } from "../../constants/pricingPage.ts";
import { fill, homeValues, type HomeSources } from "./home.ts";

/** The constants the pricing copy is filled from: the homepage's, plus the renewal numbers (AC-17). */
export interface PricingSources extends HomeSources {
  /** Spec 0005 AC-14 (`graceDays`) and spec 0007 AC-1 (`removedAfterDays`): check them if these change. */
  renewal: { graceDays: number; removedAfterDays: number };
}

/** Every `{name}` the pricing copy uses: `homeValues` (spec 0019) plus the two renewal numbers. */
export function pricingValues(sources: PricingSources): Record<string, string | number> {
  return {
    ...homeValues(sources),
    graceDays: sources.renewal.graceDays,
    removedAfterDays: sources.renewal.removedAfterDays,
  };
}

// AC-7: the plan names the old Pricing.astro sent, so the trial_interest history carries on.
const planNames: Record<PlanId, string> = {
  tz: "RareBooks",
  yearly: "RareBooks Yearly",
  monthly: "RareBooks Monthly",
};

export interface CtaButton {
  label: string;
  href: string;
  ctaLocation: string;
  /** Sent only by the plan buttons. */
  planName?: string;
}

export interface PlanView {
  id: PlanId;
  /** The plan name's h2 id, which the card's `aria-labelledby` names (AC-4). */
  headingId: string;
  badge?: string;
  name: string;
  price: string;
  period: string;
  note: string;
  extra?: string;
  /** The abroad Yearly card, drawn with the brand border (AC-5). */
  featured: boolean;
  features: string[];
  button: CtaButton;
}

export interface PricingView {
  local: boolean;
  signedIn: boolean;
  plans: {
    /** Still holds its `*word*`, for `splitHighlight`. */
    title: string;
    lead: string;
    cards: PlanView[];
    unlimited: string;
  };
  setup: { title: string; lead: string; offers: ServiceOffer[] };
  included: { title: string; lead: string; groups: { title: string; items: string[] }[] };
  faq: { title: string; items: { question: string; answer: string }[]; contact: string };
  /** The closing band, HomeCta with the same version's homepage copy (AC-1). */
  cta: HomeCopy["cta"];
}

/**
 * What /pricing shows (AC-3 to AC-10): the Tanzania version for `TZ`, the abroad version for anything else,
 * an unknown country included. A signed in visitor's plan buttons go to /welcome instead of sign up.
 */
export function pricingView(countryCode: string | undefined, signedIn: boolean): PricingView {
  const local = isTanzania(countryCode ?? "US");
  const copy: PricingCopy = local ? pricingCopy.local : pricingCopy.abroad;
  const values = pricingValues(AppConfig);
  const text = (template: string) => fill(template, values);

  const planButton = (id: PlanId, label: string): CtaButton =>
    signedIn
      ? { label: welcomeLabel, href: welcomePath, ctaLocation: "pricing_page", planName: planNames[id] }
      : { label, href: AppConfig.urls.signUpUrl, ctaLocation: "pricing_page", planName: planNames[id] };

  return {
    local,
    signedIn,
    plans: {
      title: copy.plans.title,
      lead: text(copy.plans.lead),
      cards: copy.plans.cards.map((card) => ({
        id: card.id,
        headingId: `pricing-plan-${card.id}`,
        badge: card.badge,
        name: card.name,
        price: text(card.price),
        period: card.period,
        note: text(card.note),
        extra: card.extra && text(card.extra),
        featured: card.id === "yearly",
        features: AppConfig.hostedPlan.features,
        button: planButton(card.id, card.primary),
      })),
      unlimited: text(copy.plans.unlimited),
    },
    setup: {
      title: copy.setup.title,
      lead: copy.setup.lead,
      offers: local ? AppConfig.localServices : AppConfig.abroadServices,
    },
    included: { title: copy.included.title, lead: copy.included.lead, groups: AppConfig.hostedPlan.included },
    faq: {
      title: copy.faq.title,
      items: copy.faq.items.map((item) => ({ question: item.question, answer: text(item.answer) })),
      contact: copy.faq.contact,
    },
    cta: local ? homeCopy.local.cta : homeCopy.abroad.cta,
  };
}

/** The constants the structured data reads (AC-13). */
export interface JsonLdSources {
  urls: { rootUrl: string };
  hostedPlan: {
    priceTZS: { yearly: string };
    priceUSD: { monthly: string; yearly: string };
  };
}

// "300,000" → "300000": Schema.org prices carry no thousands separators.
const bare = (price: string) => price.replaceAll(",", "");

function offer(url: string, name: string, price: string, priceCurrency: string, unitCode: "ANN" | "MON") {
  return {
    "@type": "Offer",
    name,
    price,
    priceCurrency,
    url,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency,
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode },
    },
  };
}

/**
 * The one fixed structured data block for /pricing (AC-13): the same for every visitor, so it lists all
 * three prices, while the page body shows only the visitor's own currency.
 */
export function pricingJsonLd(sources: JsonLdSources) {
  const url = `${sources.urls.rootUrl}/pricing`;
  const { priceTZS, priceUSD } = sources.hostedPlan;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RareBooks",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url,
    offers: [
      offer(url, "RareBooks Yearly (TZS)", bare(priceTZS.yearly), "TZS", "ANN"),
      offer(url, "RareBooks Monthly", bare(priceUSD.monthly), "USD", "MON"),
      offer(url, "RareBooks Yearly", bare(priceUSD.yearly), "USD", "ANN"),
    ],
  };
}
