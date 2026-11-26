// Spec 0022: the marketing pages load only what first paint needs. The guard (AC-12) fails when an eager
// script comes back; the proxy tests hold AC-8's routing and header rules.

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { forward, upstreamHeaders, upstreamUrl } from "../../src/lib/marketing/ingest.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (path: string) => readFileSync(join(root, path), "utf8");

const SCANNED_DIRS = ["src/layouts", "src/components/marketing", "src/pages"];
const SKIPPED = ["src/layouts/PortalLayout.astro", "src/pages/dashboard/", "src/pages/api/"];
const EXTENSIONS = [".astro", ".ts", ".tsx", ".mdx"];
const FORBIDDEN = ["googletagmanager", "turnstile/v0/api.js", "ContactUs", "client:load"];

function filesUnder(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = `${dir}/${name}`;
    if (SKIPPED.some((skip) => path === skip || path.startsWith(skip))) return [];
    if (statSync(join(root, path)).isDirectory()) return filesUnder(path);
    return EXTENSIONS.some((ext) => name.endsWith(ext)) ? [path] : [];
  });
}

/** The marketing files that contain a forbidden string, as "path: string". */
export function eagerScriptHits(files: { path: string; text: string }[]): string[] {
  return files.flatMap(({ path, text }) =>
    FORBIDDEN.filter((needle) => text.includes(needle)).map((needle) => `${path}: ${needle}`),
  );
}

/** The TawkWidget tags a file renders, as their attribute text. */
function tawkTags(text: string): string[] {
  return [...text.matchAll(/<TawkWidget\b([^>]*)\/?>/g)].map((match) => match[1]);
}

test("no marketing file loads GTM, Turnstile, the contact form or a client:load island (AC-12)", () => {
  const files = SCANNED_DIRS.flatMap(filesUnder).map((path) => ({ path, text: read(path) }));
  assert.ok(files.length > 20, "the scan found the marketing files");
  assert.ok(files.some((f) => f.path === "src/layouts/Layout.astro"));
  assert.ok(!files.some((f) => f.path.startsWith("src/pages/dashboard/")), "the dashboard is skipped");
  assert.deepEqual(eagerScriptHits(files), []);
});

test("the guard catches a client:load put back on a marketing component (AC-12)", () => {
  const hits = eagerScriptHits([{ path: "src/components/marketing/X.astro", text: "<Form client:load />" }]);
  assert.deepEqual(hits, ["src/components/marketing/X.astro: client:load"]);
});

test("Layout loads the chat on interaction and PortalLayout keeps it eager (AC-2, AC-12)", () => {
  const layout = tawkTags(read("src/layouts/Layout.astro"));
  assert.equal(layout.length, 1);
  assert.match(layout[0], /load="interaction"/);
  const portal = tawkTags(read("src/layouts/PortalLayout.astro"));
  assert.equal(portal.length, 1);
  assert.doesNotMatch(portal[0], /load=/);
});

test("the dashboard pages still load Turnstile themselves (AC-10, AC-12)", () => {
  for (const page of ["src/pages/dashboard/index.astro", "src/pages/dashboard/start.astro"]) {
    assert.match(read(page), /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/, page);
  }
});

test("the contact form, its route and its email template are gone (AC-4)", () => {
  for (const path of [
    "src/components/ContactUsModal.astro",
    "src/components/ContactUsForm.tsx",
    "src/pages/api/contact-us.ts",
    "src/components/templates/enquiry-email.tsx",
  ]) {
    assert.throws(() => statSync(join(root, path)), /ENOENT/, path);
  }
});

test("every Contact us control is a mailto link that opens the chat (AC-3)", () => {
  const controls = [
    ["src/components/marketing/home/HomePricingTeaser.astro", "pricing_setup"],
    ["src/components/marketing/home/HomeFaq.astro", "faq"],
    ["src/components/marketing/pricing/PricingSetup.astro", "pricing_page_setup"],
    ["src/components/marketing/pricing/PricingFaq.astro", "pricing_faq"],
  ];
  for (const [path, location] of controls) {
    const text = read(path);
    assert.doesNotMatch(text, /contact-us-modal/, path);
    assert.match(text, /mailto:\$\{AppConfig\.emails\.supportEmail\}/, path);
    assert.match(text, /data-open-chat/, path);
    assert.match(text, new RegExp(`data-cta-location="${location}"`), path);
  }
});

test("Layout carries PostHog's snippet with the AC-7 options and no GTM code (AC-5, AC-6, AC-7, AC-9)", () => {
  const layout = read("src/layouts/Layout.astro");
  assert.doesNotMatch(layout, /dataLayer|googletagmanager|ns\.html/);
  assert.match(layout, /posthogKey && \(/, "the snippet renders only with a key");
  assert.match(layout, /window\.addEventListener\("load", function \(\) \{\s*window\.posthog\.init\(posthogKey/);
  for (const option of [
    'api_host: "/ingest"',
    'ui_host: "https://eu.posthog.com"',
    "capture_pageview: true",
    "autocapture: false",
    "disable_session_recording: true",
    "disable_surveys: true",
    "advanced_disable_flags: true",
    'person_profiles: "identified_only"',
    'persistence: "cookie"',
  ]) {
    assert.ok(layout.includes(option), option);
  }
  assert.doesNotMatch(layout, /posthog\.identify|\.identify\(/);
  assert.match(layout, /define:vars=\{\{ signUpUrl, supportEmail \}\}/);
  assert.match(layout, /rbTrack\("trial_interest"/);
  assert.match(layout, /rbTrack\("contact_click"/);
});

test("the privacy page names PostHog in place of Google Tag Manager (AC-11)", () => {
  const page = read("src/pages/privacy.astro");
  assert.doesNotMatch(page, /Google Tag Manager/);
  assert.ok(
    page.includes(
      "<strong>PostHog (EU cloud)</strong>: for analytics about the pages you visit on rarebooks.cc and the sign up and contact buttons you click. It sets a cookie to link the pages of one visit.",
    ),
  );
  assert.match(page, /<strong>tawk\.to<\/strong>/);
});

test("the middleware lets /ingest/ skip Clerk (AC-8)", () => {
  const middleware = read("src/middleware.ts");
  assert.match(middleware, /pathname\.startsWith\("\/ingest\/"\)\) return next\(\)/);
});

test("the proxy sends assets to the assets host and the rest to the API host (AC-8)", () => {
  assert.equal(
    upstreamUrl("https://rarebooks.cc/ingest/static/array.js?v=1"),
    "https://eu-assets.i.posthog.com/static/array.js?v=1",
  );
  assert.equal(
    upstreamUrl("https://rarebooks.cc/ingest/array/phc_x/config.js"),
    "https://eu-assets.i.posthog.com/array/phc_x/config.js",
  );
  assert.equal(
    upstreamUrl("https://rarebooks.cc/ingest/e/?compression=gzip-js&ver=1.455.4"),
    "https://eu.i.posthog.com/e/?compression=gzip-js&ver=1.455.4",
  );
  assert.equal(upstreamUrl("https://rarebooks.cc/ingest/flags/?v=2"), "https://eu.i.posthog.com/flags/?v=2");
  // A path that only looks like an asset path stays on the API host.
  assert.equal(upstreamUrl("https://rarebooks.cc/ingest/e/static/x"), "https://eu.i.posthog.com/e/static/x");
});

test("the proxy forwards only the four allowed headers, plus X-Forwarded-For (AC-8)", () => {
  const headers = upstreamHeaders(
    new Headers({
      "content-type": "text/plain",
      "content-encoding": "gzip",
      accept: "*/*",
      "user-agent": "Phone",
      cookie: "__session=secret",
      authorization: "Bearer x",
      "cf-connecting-ip": "203.0.113.9",
      "cf-ray": "abc",
      referer: "https://rarebooks.cc/",
    }),
  );
  assert.deepEqual([...headers.keys()].sort(), [
    "accept",
    "content-encoding",
    "content-type",
    "user-agent",
    "x-forwarded-for",
  ]);
  assert.equal(headers.get("x-forwarded-for"), "203.0.113.9");
});

test("the proxy keeps method and body, and passes status, body and two headers back (AC-8)", async () => {
  let seen: { url: string; init: RequestInit } | undefined;
  const fakeFetch = (async (url: string, init: RequestInit) => {
    seen = { url, init };
    return new Response("ok", {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "max-age=60", "set-cookie": "a=b", "x-other": "1" },
    });
  }) as unknown as typeof fetch;
  const request = new Request("https://rarebooks.cc/ingest/e/?ver=1", {
    method: "POST",
    body: "payload",
    headers: { cookie: "__session=secret", "content-type": "text/plain" },
  });
  const response = await forward(request, fakeFetch);
  assert.equal(seen?.url, "https://eu.i.posthog.com/e/?ver=1");
  assert.equal(seen?.init.method, "POST");
  assert.equal(new TextDecoder().decode(seen?.init.body as ArrayBuffer), "payload");
  assert.equal((seen?.init.headers as Headers).get("cookie"), null);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "ok");
  assert.deepEqual([...response.headers.keys()].sort(), ["cache-control", "content-type"]);
});

test("the proxy answers an empty 502 when PostHog can't be reached (AC-8, AC-9)", async () => {
  const failing = (async () => {
    throw new TypeError("network down");
  }) as unknown as typeof fetch;
  const response = await forward(new Request("https://rarebooks.cc/ingest/e/", { method: "POST", body: "x" }), failing);
  assert.equal(response.status, 502);
  assert.equal(await response.text(), "");
});

