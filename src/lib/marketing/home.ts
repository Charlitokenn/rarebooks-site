// Helpers for the homepage copy (spec 0019). No imports or path aliases, so `node --test` runs them as
// they are.

/**
 * Fills each `{name}` in `template` with `values[name]`, inserted exactly as stored (AC-3). A placeholder
 * with no value throws, so a typo fails the build instead of showing braces to a visitor.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    if (!(name in values)) throw new Error(`No value for {${name}} in "${template}"`);
    return String(values[name]);
  });
}

/**
 * Splits a headline at its one `*word*` (the MkHighlight word): `[before, word, after]`. With no star pair
 * the word is empty.
 */
export function splitHighlight(text: string): [string, string, string] {
  const match = /^(.*?)\*([^*]+)\*(.*)$/.exec(text);
  return match ? [match[1], match[2], match[3]] : [text, "", ""];
}

/** The constants the copy's placeholders are filled from (spec 0019, Value sourcing). */
export interface HomeSources {
  trial: { freeDays: number; payFromDay: number; readOnlyFromDay: number; removedOnDay: number };
  hostedPlan: {
    priceTZS: { yearly: string };
    priceUSD: { monthly: string; yearly: string; yearlySaving: string };
  };
  localServices: { price: string }[];
  emails: { supportEmail: string };
  urls: { docsHomePath: string };
}

/** Every `{name}` the homepage copy uses, each from the one constant spec 0019 names for it. */
export function homeValues(sources: HomeSources): Record<string, string | number> {
  const { trial, hostedPlan, localServices, emails, urls } = sources;
  return {
    freeDays: trial.freeDays,
    payFromDay: trial.payFromDay,
    readOnlyFromDay: trial.readOnlyFromDay,
    removedOnDay: trial.removedOnDay,
    tzsYear: hostedPlan.priceTZS.yearly,
    usdYear: hostedPlan.priceUSD.yearly,
    usdMonth: hostedPlan.priceUSD.monthly,
    usdSaving: hostedPlan.priceUSD.yearlySaving,
    // The quick start offer, which already holds its currency ("TZS 75,000").
    quickStart: localServices[1].price,
    supportEmail: emails.supportEmail,
    docsHomePath: urls.docsHomePath,
  };
}

/** The `-tzs` screenshot set for the Tanzania version, `-usd` for everyone else (AC-8). */
export function shotName<T extends string>(name: T, local: boolean): `${T}-tzs` | `${T}-usd` {
  return local ? `${name}-tzs` : `${name}-usd`;
}

/** The trust row's quote shows only once its quote, name and business are all filled in (AC-7). */
export function hasQuote(testimonial: { quote: string; name: string; business: string }): boolean {
  return [testimonial.quote, testimonial.name, testimonial.business].every((part) => part.trim() !== "");
}
