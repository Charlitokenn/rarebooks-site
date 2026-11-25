// The comparison pages' data (spec 0021): the fixed rows, a source for every competitor fact, RareBooks
// claims from one place in the visitor's currency, the head rules, escaping, the breadcrumb and the redirect
// invariants. Each rule runs over the real list and over a fixture, so a rule that can never fail shows up.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  competitors,
  fillRareBooks,
  rareBooksRowsFor,
  rowLabels,
  rowOrder,
  sortedCompetitors,
  type CompetitorEntry,
  type RowKey,
} from "../../src/data/competitors.ts";
import { blogRedirects, blogSlugs, retiredCompetitors } from "../../src/data/retiredCompetitors.ts";
import { breadcrumbJsonLd } from "../../src/lib/marketing/breadcrumb.ts";
import { escapeHtml } from "../../src/lib/marketing/escapeHtml.ts";
import { jsonLdText } from "../../src/lib/marketing/jsonLd.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const today = new Date().toISOString().slice(0, 10);
const source = { url: "https://example.com/pricing", checkedOn: "2026-11-25" };

/** A complete, valid entry for proving each check; never shipped. */
function fixture(): CompetitorEntry {
  const rows = Object.fromEntries(rowOrder.map((key) => [key, `Example ${key}`])) as Record<RowKey, string>;
  const sources = Object.fromEntries(["pricing", ...rowOrder].map((key) => [key, { ...source }])) as CompetitorEntry["sources"];
  const card = (heading: string) => ({ heading, body: `${heading} body, from {price}.` });
  return {
    slug: "example",
    name: "Example Books",
    shortName: "Example",
    summary: "An example tool for the tests.",
    metaDescription: "Compare RareBooks vs Example: price, features and fit for small businesses.",
    pricingCompetitor: "USD 10 a month",
    rows,
    sources,
    bestForCompetitor: "Teams that want an example.",
    bestForRareBooks: "Shops that sell from the counter, for {price}.",
    deepDives: [
      { title: "One", intro: "First.", rarebooks: card("RareBooks"), competitor: card("Example") },
      { title: "Two", intro: "Second.", rarebooks: card("RareBooks"), competitor: card("Example") },
    ],
    recommendationCompetitor: "Pick Example for its reports.",
    recommendationRareBooks: "Pick RareBooks to sell and count stock in one place.",
    whenToChooseCompetitor: "When you want Example's reports.",
    whySwitchToRareBooks: "Point of sale and stock come included.",
    migrationSteps: ["Export.", "Set up.", "Import.", "Start selling."],
    faqs: [
      { q: "Can I try it?", a: "Yes, free for {freeDays} days." },
      { q: "Is my data mine?", a: "Yes, export to CSV at any time." },
    ],
  };
}

/** AC-4: every fact key has an https source and a past `YYYY-MM-DD` date. */
function sourceProblems(entry: CompetitorEntry): string[] {
  const problems: string[] = [];
  for (const key of ["pricing", ...rowOrder] as const) {
    const found = entry.sources[key];
    if (!found) problems.push(`${entry.slug}: no source for ${key}`);
    else {
      if (!found.url.startsWith("https://")) problems.push(`${entry.slug}: ${key} url is not https`);
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(found.checkedOn) && !Number.isNaN(Date.parse(found.checkedOn));
      if (!valid) problems.push(`${entry.slug}: ${key} date ${found.checkedOn} is malformed`);
      else if (found.checkedOn > today) problems.push(`${entry.slug}: ${key} date ${found.checkedOn} is in the future`);
    }
  }
  return problems;
}

/** AC-3, AC-7, AC-14: the nine rows filled, lengths, no price in the meta or summary. */
function shapeProblems(entry: CompetitorEntry): string[] {
  const problems: string[] = [];
  const keys = Object.keys(entry.rows);
  if (keys.length !== 9 || !rowOrder.every((key) => entry.rows[key]?.trim())) problems.push(`${entry.slug}: rows`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug)) problems.push(`${entry.slug}: slug is not kebab case`);
  if (entry.metaDescription.length > 160) problems.push(`${entry.slug}: metaDescription over 160`);
  if (entry.summary.length > 120) problems.push(`${entry.slug}: summary over 120`);
  for (const text of [entry.metaDescription, entry.summary]) {
    if (/TZS|USD|\$/.test(text)) problems.push(`${entry.slug}: a price in "${text}"`);
  }
  return problems;
}

/** Every RareBooks prose field of an entry (AC-5), unfilled. */
function rareBooksProse(entry: CompetitorEntry): string[] {
  return [
    entry.bestForRareBooks,
    entry.recommendationRareBooks,
    entry.whySwitchToRareBooks,
    ...entry.deepDives.flatMap((dive) => [dive.rarebooks.heading, dive.rarebooks.body]),
    ...entry.migrationSteps,
    ...entry.faqs.flatMap((faq) => [faq.q, faq.a]),
  ];
}

const staleWords = /offline|appsumo|licen|grace period|device/i;
// Spec 0021 conflict, owed to /architect: AC-5 scans the row templates for "device", but the approved Users
// row is "Unlimited users and devices" (not a device bound license). Only that exact phrase is let through.
const isStale = (text: string) => staleWords.test(text.replace("Unlimited users and devices", ""));
/** AC-5: the stale claims, scanned in the RareBooks fields only. */
function staleClaims(entry: CompetitorEntry): string[] {
  return rareBooksProse(entry).filter(isStale);
}

/** AC-6: RareBooks prose may use `{price}`, never the raw price placeholders. */
function rawPricePlaceholders(entry: CompetitorEntry): string[] {
  return rareBooksProse(entry).filter((text) => /\{(tzsYear|usdYear|usdMonth)\}/.test(text));
}

/** Copy has no em or en dash (AC-15). */
function dashes(entry: CompetitorEntry): string[] {
  const strings: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") strings.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk({ ...entry, sources: undefined });
  return strings.filter((text) => /[–—]/.test(text));
}

const all = (check: (entry: CompetitorEntry) => string[]) => competitors.flatMap(check);

test("the nine rows, their labels and order (AC-3)", () => {
  assert.deepEqual(rowOrder, ["price", "trial", "pos", "stock", "invoicing", "currency", "users", "mobileMoney", "support"]);
  assert.deepEqual(
    rowOrder.map((key) => rowLabels[key]),
    [
      "Price",
      "Free trial",
      "Point of sale",
      "Stock and batches",
      "Invoices and quotes",
      "More than one currency",
      "Users included",
      "Mobile money accounts",
      "Support",
    ],
  );
  assert.deepEqual(all(shapeProblems), []);
  assert.deepEqual(shapeProblems(fixture()), []);
  const short = fixture();
  delete (short.rows as Partial<Record<RowKey, string>>).support;
  assert.notDeepEqual(shapeProblems(short), []);
});

test("every competitor fact has an https source with a past date (AC-4)", () => {
  assert.deepEqual(all(sourceProblems), []);
  assert.deepEqual(sourceProblems(fixture()), []);
  const missing = fixture();
  delete (missing.sources as Partial<CompetitorEntry["sources"]>).pos;
  assert.match(sourceProblems(missing).join(), /no source for pos/);
  const plain = fixture();
  plain.sources.price = { url: "http://example.com", checkedOn: "2026-11-01" };
  assert.match(sourceProblems(plain).join(), /not https/);
  const future = fixture();
  future.sources.trial = { url: "https://example.com", checkedOn: "2999-01-01" };
  assert.match(sourceProblems(future).join(), /in the future/);
  const malformed = fixture();
  malformed.sources.users = { url: "https://example.com", checkedOn: "25/11/2026" };
  assert.match(sourceProblems(malformed).join(), /malformed/);
});

test("no RareBooks field makes a stale claim, competitor text may (AC-5)", () => {
  for (const local of [true, false]) {
    assert.deepEqual(Object.values(rareBooksRowsFor(local)).filter(isStale), []);
  }
  assert.deepEqual(all(staleClaims), []);
  const stale = fixture();
  stale.bestForRareBooks = "Works offline on any device.";
  stale.bestForCompetitor = "Runs offline.";
  assert.deepEqual(staleClaims(stale), ["Works offline on any device."]);
});

test("RareBooks prices show in the visitor's own currency (AC-6)", () => {
  const local = rareBooksRowsFor(true);
  const abroad = rareBooksRowsFor(false);
  assert.equal(local.price, "TZS 300,000 a year, everything included");
  assert.equal(abroad.price, "USD 39 a month or USD 399 a year, everything included");
  assert.equal(local.trial, "21 days, no card needed");
  for (const key of rowOrder.filter((row) => row !== "price")) assert.equal(local[key], abroad[key]);

  for (const entry of [...competitors, fixture()]) {
    const filledLocal = [...rareBooksProse(entry), ...Object.values(local)].map((text) => fillRareBooks(text, true));
    const filledAbroad = [...rareBooksProse(entry), ...Object.values(abroad)].map((text) =>
      fillRareBooks(text, false),
    );
    assert.doesNotMatch(filledLocal.join("\n"), /USD|\$/, entry.slug);
    assert.doesNotMatch(filledAbroad.join("\n"), /TZS/, entry.slug);
    assert.doesNotMatch([...filledLocal, ...filledAbroad].join("\n"), /[{}]/, entry.slug);
  }
  assert.match(fillRareBooks(fixture().bestForRareBooks, true), /TZS 300,000 a year/);
  assert.match(fillRareBooks(fixture().bestForRareBooks, false), /USD 39 a month or USD 399 a year/);
  assert.deepEqual(all(rawPricePlaceholders), []);
  const raw = fixture();
  raw.whySwitchToRareBooks = "Only TZS {tzsYear}.";
  assert.deepEqual(rawPricePlaceholders(raw), ["Only TZS {tzsYear}."]);
  assert.throws(() => fillRareBooks("{nope}", true), /nope/);
});

test("copy has no em or en dash (AC-15)", () => {
  assert.deepEqual(all(dashes), []);
  const dashed = fixture();
  dashed.recommendationCompetitor = "Good — really.";
  assert.equal(dashes(dashed).length, 1);
});

test("slugs are unique, sorted by name for the index (AC-2, AC-14)", () => {
  const slugs = competitors.map((entry) => entry.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  const a = { ...fixture(), slug: "a", name: "zoho Books" };
  const b = { ...fixture(), slug: "b", name: "Xero" };
  const c = { ...fixture(), slug: "c", name: "FreshBooks" };
  assert.deepEqual(
    sortedCompetitors([a, b, c]).map((entry) => entry.slug),
    ["c", "b", "a"],
  );
});

test("escapeHtml writes markup as text (AC-11)", () => {
  assert.equal(escapeHtml(`<b>Tom & "Jerry's"</b>`), "&lt;b&gt;Tom &amp; &quot;Jerry&#39;s&quot;&lt;/b&gt;");
  assert.equal(escapeHtml("plain"), "plain");
});

test("the BreadcrumbList has the exact shape (AC-8)", () => {
  assert.equal(
    jsonLdText(breadcrumbJsonLd("https://rarebooks.cc", "compare", "xero", "RareBooks vs Xero")),
    '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://rarebooks.cc/"},{"@type":"ListItem","position":2,"name":"Compare","item":"https://rarebooks.cc/compare"},{"@type":"ListItem","position":3,"name":"RareBooks vs Xero","item":"https://rarebooks.cc/compare/xero"}]}',
  );
  const alternatives = breadcrumbJsonLd("https://rarebooks.cc", "alternatives", "xero", "Xero alternative") as {
    itemListElement: { name: string; item: string }[];
  };
  assert.deepEqual(
    alternatives.itemListElement.map((item) => [item.name, item.item]),
    [
      ["Home", "https://rarebooks.cc/"],
      ["Alternatives", "https://rarebooks.cc/alternatives"],
      ["Xero alternative", "https://rarebooks.cc/alternatives/xero"],
    ],
  );
});

test("retired slugs: no overlap, no chained successor, one hop blog redirects (AC-10)", () => {
  const kept = new Set(competitors.map((entry) => entry.slug));
  for (const [old, successor] of Object.entries(retiredCompetitors)) {
    assert.ok(!kept.has(old), `${old} is in both lists`);
    if (successor !== null) {
      assert.ok(kept.has(successor), `${old} points at ${successor}, which is not in competitors`);
      assert.ok(!(successor in retiredCompetitors), `${old} points at retired ${successor}`);
    }
  }
  const retiredUrls = new Set(Object.keys(retiredCompetitors).map((slug) => `/compare/${slug}`));
  for (const target of Object.values(blogRedirects(retiredCompetitors))) assert.ok(!retiredUrls.has(target), target);

  // The rule itself, on a sample map.
  const sample = { "sage-50": "sage", turbocash: null };
  const redirects = blogRedirects(sample);
  assert.equal(Object.keys(redirects).length, blogSlugs.length);
  assert.equal(redirects["/blog/rarebooks-vs-sage-50"], "/compare/sage");
  assert.equal(redirects["/blog/rarebooks-vs-turbocash"], "/compare");
  assert.equal(redirects["/blog/rarebooks-vs-gnucash"], "/compare/gnucash");
});

test("the routes render per request, 404 unknown slugs and send the private cache header (AC-2, AC-6)", () => {
  for (const section of ["compare", "alternatives"]) {
    const route = read(`src/pages/${section}/[slug].astro`);
    assert.match(route, /export const prerender = false/);
    assert.match(route, /return Astro\.rewrite\("\/404"\)/);
    assert.match(route, /"Cache-Control", "private, no-cache"/);
    assert.match(route, /isTanzania\(Astro\.locals\.countryCode \?\? "US"\)/);
  }
});

test("the layouts carry the head, bands, buttons and no old tokens (AC-7, AC-11, AC-13, AC-17)", () => {
  const compare = read("src/layouts/CompareLayout.astro");
  const alternatives = read("src/layouts/AlternativesLayout.astro");
  assert.match(compare, /title=\{`RareBooks vs \$\{shortName\} \| Platform Comparison`\}/);
  assert.match(alternatives, /title=\{`Best \$\{shortName\} Alternative for SMEs \| RareBooks`\}/);
  for (const layout of [compare, alternatives]) {
    assert.match(layout, /ogImage="\/og\/home\.jpg"/);
    assert.match(layout, /ogImageAlt=\{homeCopy\.abroad\.hero\.screenshotAlt\}/);
    assert.match(layout, /preloadSerif/);
    // Bands in order: the hero is canvas, then these, then HomeCta on ink.
    const tones = [...layout.matchAll(/<MkSection tone="(\w+)"/g)].map((match) => match[1]);
    assert.deepEqual(tones, ["tint", "canvas", "tint", "canvas"]);
    assert.doesNotMatch(layout, /bg-brand|text-ink|text-muted|font-display|rounded-pill|shadow-card|shadow-soft|dotted-bg|hero-glow/);
    assert.doesNotMatch(layout, /[–—]/);
  }
  assert.match(compare, /location="compare_page_header"/);
  assert.match(compare, /location="compare_page_footer"/);
  assert.match(alternatives, /location="alternatives_page_header"/);
  assert.match(alternatives, /location="alternatives_page_footer"/);
  assert.match(alternatives, /escapeHtml\(text\(faq\.a\)\)/);

  const hero = read("src/components/marketing/compare/CompareHero.astro");
  assert.match(hero, /signedIn \?[\s\S]*href="\/dashboard"[\s\S]*dashboardLabel[\s\S]*AppConfig\.urls\.signUpUrl/);
  assert.match(hero, /aria-current="page"/);
  const cta = read("src/components/marketing/home/HomeCta.astro");
  assert.match(cta, /location = "final_cta_section"/);
  assert.equal(cta.match(/data-cta-location=\{location\}/g)?.length, 2);
});

test("the table keeps its semantics at every width (AC-9)", () => {
  const table = read("src/components/marketing/compare/CompareTable.astro");
  for (const part of [
    '<table role="table"',
    "<caption",
    '<thead role="rowgroup"',
    '<tbody role="rowgroup"',
    'scope="col" role="columnheader"',
    'scope="row" role="rowheader"',
    'role="cell" data-label="RareBooks"',
    'role="cell" data-label={shortName}',
    'content: attr(data-label) / ""',
  ]) {
    assert.ok(table.includes(part), part);
  }
});
