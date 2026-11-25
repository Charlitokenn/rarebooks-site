// The marketing nav and footer rules (spec 0018). The helpers decide what MkNav and MkFooter render; the
// source checks hold the rules a render can't easily show (one <main> per page, no React, the small script).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { AppConfig } from "../../src/constants/index.ts";
import { footerColumns, navLinks } from "../../src/constants/navigation.ts";
import { compareCurrent, isSignedIn, pricingCurrent, visibleFooterColumns } from "../../src/lib/marketing/navigation.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("the four nav links, in order (AC-3)", () => {
  assert.deepEqual(navLinks, [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Compare", href: "/compare" },
    { label: "Docs", href: "/getting-started/getting-started-with-rarebooks/" },
  ]);
});

test("signed in comes from locals.auth, and a missing or failing auth counts as signed out (AC-4)", () => {
  assert.equal(isSignedIn({ auth: () => ({ isAuthenticated: true }) }), true);
  assert.equal(isSignedIn({ auth: () => ({ isAuthenticated: false }) }), false);
  assert.equal(isSignedIn({}), false);
  assert.equal(isSignedIn(undefined), false);
  assert.equal(
    isSignedIn({
      auth: () => {
        throw new Error("no session");
      },
    }),
    false,
  );
});

test("only Compare is marked, as page on /compare and true below it (AC-7)", () => {
  assert.equal(compareCurrent("/compare"), "page");
  assert.equal(compareCurrent("/compare/"), "page");
  assert.equal(compareCurrent("/compare/gnucash"), "true");
  assert.equal(compareCurrent("/alternatives/gnucash"), undefined);
  assert.equal(compareCurrent("/"), undefined);
  assert.equal(compareCurrent("/comparenot"), undefined);
});

test("Pricing points at /pricing and is marked only there (spec 0020 AC-14)", () => {
  const footerPricing = footerColumns[0].links.find((l) => l.label === "Pricing");
  assert.equal(footerPricing?.href, "/pricing");
  assert.equal(pricingCurrent("/pricing"), "page");
  assert.equal(pricingCurrent("/pricing/"), "page");
  assert.equal(pricingCurrent("/"), undefined);
  assert.equal(pricingCurrent("/pricing/extra"), undefined);
  assert.equal(pricingCurrent("/pricingnot"), undefined);
  assert.match(read("src/components/marketing/MkNav.astro"), /pricingCurrent\(pathname\)/);
});

test("footer links follow sign in state, and Legal waits for approval (AC-9, AC-10)", () => {
  const labels = (signedIn: boolean, approved: boolean) =>
    visibleFooterColumns(footerColumns, signedIn, approved).map((c) => [c.title, c.links.map((l) => l.label)]);

  assert.deepEqual(labels(false, false), [
    ["Product", ["Features", "Pricing", "Start free trial", "Sign in"]],
    ["Compare", ["All comparisons", "Alternatives guides"]],
    ["Resources", ["Docs", "Support"]],
  ]);
  assert.deepEqual(labels(true, true), [
    ["Product", ["Features", "Pricing", "Dashboard"]],
    ["Compare", ["All comparisons", "Alternatives guides"]],
    ["Resources", ["Docs", "Support"]],
    ["Legal", ["Privacy", "Terms"]],
  ]);
  const support = footerColumns[2].links[1];
  assert.equal(support.href, `mailto:${AppConfig.emails.supportEmail}`);
});

test("every Start free trial link goes to sign up with its location (AC-8)", () => {
  const trial = footerColumns.flatMap((c) => c.links).find((l) => l.label === "Start free trial");
  assert.deepEqual([trial?.href, trial?.ctaLocation], ["/auth/sign-up", "footer"]);
  const nav = read("src/components/marketing/MkNav.astro");
  assert.match(nav, /data-cta-location="nav"/);
  assert.match(nav, /data-cta-location="nav-mobile"/);
});

test("legal pages stay hidden until approved, and approval needs a controller (AC-10)", () => {
  const { approved, controller, updated } = AppConfig.legal;
  assert.match(updated, /^\d{4}-\d{2}-\d{2}$/);
  if (approved) assert.ok(controller.name && controller.address, "fill in AppConfig.legal.controller first");
  for (const page of ["src/pages/privacy.astro", "src/pages/terms.astro"]) {
    const source = read(page);
    assert.match(source, /export const prerender = false/);
    assert.match(source, /headers\.set\("X-Robots-Tag", "noindex"\)/);
  }
});

test("each marketing page has exactly one <main id=\"main\"> (AC-6)", () => {
  const pages = [
    "src/pages/index.astro",
    "src/pages/pricing.astro",
    "src/pages/404.astro",
    "src/pages/compare/index.astro",
    "src/pages/alternatives/index.astro",
    "src/layouts/CompareLayout.astro",
    "src/layouts/AlternativesLayout.astro",
    "src/layouts/LegalLayout.astro",
  ];
  for (const page of pages) {
    const source = read(page);
    assert.equal(source.match(/<main[\s>]/g)?.length, 1, `${page} has one <main>`);
    assert.match(source, /<main id="main"/, `${page} gives main its id`);
    assert.match(source, /<MkNav \/>/, `${page} renders MkNav`);
    assert.match(source, /<MkFooter \/>/, `${page} renders MkFooter`);
  }
  assert.doesNotMatch(read("src/layouts/Layout.astro"), /<main/);
});

test("the nav and footer ship no React, and one small inline script (AC-12)", () => {
  for (const file of ["MkNav", "MkFooter", "MkLogo", "MkSocialIcon"]) {
    const source = read(`src/components/marketing/${file}.astro`);
    assert.doesNotMatch(source, /client:|\.tsx|@clerk\/astro\/components/, `${file} has no island`);
  }
  const nav = read("src/components/marketing/MkNav.astro");
  const scripts = [...nav.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.equal(scripts.length, 1);
  assert.ok(Buffer.byteLength(scripts[0]) < 1024, "the menu script stays under 1 KB");
  assert.doesNotMatch(scripts[0], /preventDefault/);
});
