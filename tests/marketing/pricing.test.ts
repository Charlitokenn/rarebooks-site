// The /pricing page (spec 0020): the copy filled from the real constants, what each visitor sees, and the
// structured data. The source checks hold what a render can't easily show (the header, the band order).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { AppConfig } from "../../src/constants/index.ts";
import { homeCopy } from "../../src/constants/home.ts";
import { pricingCopy, type PricingCopy } from "../../src/constants/pricingPage.ts";
import { fill } from "../../src/lib/marketing/home.ts";
import { jsonLdText } from "../../src/lib/marketing/jsonLd.ts";
import { pricingJsonLd, pricingValues, pricingView } from "../../src/lib/marketing/pricing.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const values = pricingValues(AppConfig);

// Every string in a version, filled, so a placeholder with no value throws here instead of on the page.
function allText(copy: PricingCopy): string {
  const strings: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") strings.push(fill(value, values));
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(copy);
  return strings.join("\n");
}

test("every placeholder in both versions has a value (AC-17)", () => {
  const local = allText(pricingCopy.local);
  const abroad = allText(pricingCopy.abroad);
  for (const text of [local, abroad]) assert.doesNotMatch(text, /[{}]/);
  assert.match(local, /TZS 300,000/);
  assert.match(abroad, /USD 399 a year/);
  // Abroad prices name their currency, never a bare $ (CAD, AUD and others use $ too).
  for (const text of [local, abroad]) assert.doesNotMatch(text, /\$/);
  assert.match(abroad, /for 7 more days[\s\S]*60 days after that/);
  assert.throws(() => fill("{graceDay}", values), /graceDay/);
});

test("the yearly saving is twelve months less the yearly price (AC-17)", () => {
  const { monthly, yearly, yearlySaving } = AppConfig.hostedPlan.priceUSD;
  assert.equal(Number(yearlySaving), Number(monthly) * 12 - Number(yearly));
});

test("Tanzania gets one TZS plan and the two setup offers (AC-3, AC-4, AC-6, AC-8)", () => {
  const view = pricingView("TZ", false);
  assert.equal(view.local, true);
  assert.deepEqual(
    view.plans.cards.map((c) => [c.headingId, c.badge, c.price, c.period, c.featured]),
    [["pricing-plan-tz", "The plan", "TZS 300,000", "a year", false]],
  );
  assert.equal(view.plans.cards[0].features, AppConfig.hostedPlan.features);
  // Only shillings show to a Tanzania visitor: no dollar price anywhere in the body.
  assert.doesNotMatch(JSON.stringify(view), /\$\d|USD|PayPal/);
  assert.deepEqual(
    view.setup.offers.map((o) => o.name),
    ["Digitize your notebooks", "Quick start"],
  );
  assert.equal(view.faq.items.length, 5);
  assert.match(view.faq.items[1].answer, /ClickPesa/);
  assert.equal(view.cta, homeCopy.local.cta);
});

test("anywhere else, unknown included, gets Yearly then Monthly in USD only (AC-3, AC-5, AC-6, AC-8)", () => {
  for (const country of ["KE", "US", undefined]) {
    const view = pricingView(country, false);
    assert.equal(view.local, false);
    assert.deepEqual(
      view.plans.cards.map((c) => [c.headingId, c.name, c.price, c.period, c.featured]),
      [
        ["pricing-plan-yearly", "Yearly", "USD 399", "a year", true],
        ["pricing-plan-monthly", "Monthly", "USD 39", "a month", false],
      ],
    );
    assert.equal(view.plans.cards[0].badge, "Best value");
    assert.equal(view.plans.cards[0].extra, "Free data import when you take the yearly plan during your trial");
    // Only dollars show outside Tanzania: no shilling price anywhere in the body.
    assert.doesNotMatch(JSON.stringify(view), /TZS|mobile money/);
    assert.deepEqual(
      view.setup.offers.map((o) => [o.name, o.price, o.features.length]),
      [["Free data import", "Free", 0]],
    );
    assert.equal(view.faq.items.length, 5);
    assert.match(view.faq.items[1].answer, /PayPal/);
    assert.equal(view.cta, homeCopy.abroad.cta);
  }
});

test("plan buttons start sign up, or go to the dashboard when signed in (AC-7)", () => {
  const buttons = (country: string, signedIn: boolean) =>
    pricingView(country, signedIn).plans.cards.map((c) => c.button);

  assert.deepEqual(buttons("TZ", false), [
    { label: "Start free trial", href: "/auth/sign-up", ctaLocation: "pricing_page", planName: "RareBooks" },
  ]);
  assert.deepEqual(buttons("KE", false), [
    { label: "Start free trial", href: "/auth/sign-up", ctaLocation: "pricing_page", planName: "RareBooks Yearly" },
    { label: "Start free trial", href: "/auth/sign-up", ctaLocation: "pricing_page", planName: "RareBooks Monthly" },
  ]);
  for (const button of [...buttons("TZ", true), ...buttons("KE", true)]) {
    assert.equal(button.label, "Go to your dashboard");
    assert.equal(button.href, "/dashboard");
    assert.equal(button.ctaLocation, "pricing_page");
  }
  // The setup offers don't change for a signed in visitor.
  assert.deepEqual(pricingView("TZ", true).setup, pricingView("TZ", false).setup);
});

test("the included list keeps its seven groups, and the card list stays at eight (AC-9)", () => {
  assert.deepEqual(
    AppConfig.hostedPlan.included.map((g) => g.title),
    ["Accounting", "Selling and buying", "Point of sale", "Stock", "Reports", "Your team and data", "Support"],
  );
  assert.equal(AppConfig.hostedPlan.features.length, 8);
});

test("the structured data lists the three prices, bare and in their currencies (AC-13)", () => {
  const data = pricingJsonLd(AppConfig);
  assert.equal(data["@type"], "SoftwareApplication");
  assert.equal(data.url, "https://rarebooks.cc/pricing");
  assert.deepEqual(
    data.offers.map((o) => [
      o.name,
      o.price,
      o.priceCurrency,
      o.url,
      o.priceSpecification.price,
      o.priceSpecification.priceCurrency,
      o.priceSpecification.referenceQuantity.value,
      o.priceSpecification.referenceQuantity.unitCode,
    ]),
    [
      ["RareBooks Yearly (TZS)", "300000", "TZS", data.url, "300000", "TZS", 1, "ANN"],
      ["RareBooks Monthly", "39", "USD", data.url, "39", "USD", 1, "MON"],
      ["RareBooks Yearly", "399", "USD", data.url, "399", "USD", 1, "ANN"],
    ],
  );
});

test("the structured data text can't close its script tag (AC-13)", () => {
  const text = jsonLdText({ name: "</script><script>alert(1)</script>" });
  assert.doesNotMatch(text, /</);
  assert.equal(JSON.parse(text).name, "</script><script>alert(1)</script>");
  assert.match(read("src/layouts/Layout.astro"), /<script type="application\/ld\+json" set:html=\{jsonLdText\(jsonLd\)\}/);
});

test("the page sends the private cache header and renders the five bands in order (AC-1, AC-12)", () => {
  const page = read("src/pages/pricing.astro");
  assert.match(page, /export const prerender = false/);
  assert.match(page, /headers\.set\("Cache-Control", "private, no-cache"\)/);
  const order = ["<PricingPlans", "<PricingSetup", "<PricingIncluded", "<PricingFaq", "<HomeCta"].map((tag) =>
    page.indexOf(tag),
  );
  assert.ok(order.every((at, i) => at > 0 && (i === 0 || at > order[i - 1])), "bands in order");
  assert.match(page, /canonicalPath="\/pricing"/);
  assert.match(page, /jsonLd=\{pricingJsonLd\(AppConfig\)\}/);
  assert.equal(page.match(/<ContactUsModal /g)?.length, 1);
});

test("the homepage teaser keeps id pricing and links to /pricing (AC-14)", () => {
  const teaser = read("src/components/marketing/home/HomePricingTeaser.astro");
  assert.match(teaser, /id="pricing"/);
  assert.match(teaser, /href="\/pricing" variant="link" data-cta-location="pricing_more"/);
  assert.equal(homeCopy.local.pricing.more, "See full pricing");
  assert.equal(homeCopy.abroad.pricing.more, "See full pricing");
});
