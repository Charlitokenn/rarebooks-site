// Spec 0019 AC-3, AC-4: the homepage copy helpers and the trial numbers the copy is filled from.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fill, splitHighlight } from "../../src/lib/marketing/home.ts";

test("fill inserts each value exactly as stored", () => {
  assert.equal(
    fill("Free for {freeDays} days, then TZS {tzsYear} a year.", { freeDays: 21, tzsYear: "300,000" }),
    "Free for 21 days, then TZS 300,000 a year.",
  );
  assert.equal(fill("${usdYear} a year", { usdYear: "399" }), "$399 a year");
});

test("fill throws on a placeholder with no value", () => {
  assert.throws(() => fill("Decide by day {removedOnDay}", {}), /removedOnDay/);
});

test("splitHighlight finds the one highlighted word", () => {
  assert.deepEqual(splitHighlight("Your stock and sales, always *current*"), [
    "Your stock and sales, always ",
    "current",
    "",
  ]);
  assert.deepEqual(splitHighlight("Stop dreading your books. Start *trusting* them."), [
    "Stop dreading your books. Start ",
    "trusting",
    " them.",
  ]);
  assert.deepEqual(splitHighlight("No highlight"), ["No highlight", "", ""]);
});

// Spec 0019 AC-3, AC-4, AC-7, AC-9, AC-10: the copy filled from the real constants, in both versions.
import { homeCopy, type HomeCopy } from "../../src/constants/home.ts";
import { hostedPlan, localServices } from "../../src/constants/pricing.ts";
import { hasQuote, homeValues, shotName } from "../../src/lib/marketing/home.ts";

const values = homeValues({
  trial: { freeDays: 21, payFromDay: 22, readOnlyFromDay: 26, removedOnDay: 30 },
  hostedPlan,
  localServices,
  emails: { supportEmail: "support@rarebooks.cc" },
  urls: { docsHomePath: "/getting-started/getting-started-with-rarebooks/" },
});

// Every string in a version, filled, so a missing placeholder value throws here instead of on the page.
function allText(copy: HomeCopy): string {
  const strings: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") strings.push(fill(value, values));
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(copy);
  return strings.join("\n");
}

test("every placeholder in both versions has a value", () => {
  assert.doesNotThrow(() => allText(homeCopy.local));
  assert.doesNotThrow(() => allText(homeCopy.abroad));
});

test("no 30 day trial wording, and the FAQ gives the four trial days", () => {
  for (const copy of [homeCopy.local, homeCopy.abroad]) {
    assert.doesNotMatch(allText(copy), /30 days? (free|trial)/i);
    const ends = fill(copy.faq.items[1].answer, values);
    for (const day of ["21 days", "day 22", "day 26", "day 30"]) assert.match(ends, new RegExp(day));
    assert.equal(fill(copy.trial.steps[2].title, values), "Decide by day 30");
  }
});

test("Tanzania gets TZS and the quick start line, abroad gets USD and the saving", () => {
  assert.equal(fill(homeCopy.local.pricing.price, values), "TZS 300,000");
  assert.equal(
    fill(homeCopy.local.pricing.setup!.text, values),
    "Want us to set up your shop? Quick start is TZS 75,000, and it comes back as 3 free months.",
  );
  assert.equal(fill(homeCopy.abroad.pricing.price, values), "$399");
  assert.equal(fill(homeCopy.abroad.pricing.note!, values), "or $39 a month. Save $69 with yearly.");
  assert.equal(homeCopy.abroad.pricing.setup, undefined);
});

test("the features keep their order and pick the screenshot set by country", () => {
  assert.deepEqual(
    homeCopy.local.features.rows.map((row) => row.shot),
    ["home-balances", "home-pos", "home-stock", "home-profit"],
  );
  assert.equal(shotName("home-pos", true), "home-pos-tzs");
  assert.equal(shotName("home-pos", false), "home-pos-usd");
});

test("the quote shows only when quote, name and business are all filled", () => {
  assert.equal(hasQuote({ quote: "", name: "", business: "" }), false);
  assert.equal(hasQuote({ quote: "Great", name: "Asha", business: "" }), false);
  assert.equal(hasQuote({ quote: "Great", name: "Asha", business: " " }), false);
  assert.equal(hasQuote({ quote: "Great", name: "Asha", business: "Asha Pharmacy" }), true);
});
