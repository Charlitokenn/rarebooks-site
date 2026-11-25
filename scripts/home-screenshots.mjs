// Takes the homepage screenshots from the two seeded Kilima Hardware demo sites (spec 0019 AC-16).
//
//   BOOKS_SHOTS_PASSWORD=<admin password> npm run screenshots:home
//
// Seed the sites first, in rarebooks-web: `bench --site <site> execute frappe_books.demo.shop.seed --kwargs
// "{'currency': 'TZS'}"` (or 'USD'). Screenshots only ever come from those demo sites, never a customer site.
//
// Every shot is taken at 1280 by 800 with deviceScaleFactor 2 and written to a temporary folder. Only when
// every shot of both sites succeeds are they moved into src/assets/screenshots/source/, the social image
// cut to public/og/home.jpg, and `npm run screenshots` run. Any failure stops the script, names the route,
// and moves nothing.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const SITES = {
  tzs: process.env.BOOKS_SHOTS_TZS_URL || "http://shots-tzs.localhost:8000",
  usd: process.env.BOOKS_SHOTS_USD_URL || "http://shots-usd.localhost:8000",
};
const PASSWORD = process.env.BOOKS_SHOTS_PASSWORD;
const SOURCE = "src/assets/screenshots/source";
const OG_IMAGE = "public/og/home.jpg";
const TIMEOUT = 15_000;

// The point of sale cart: the first three items of the seed's ITEMS list (frappe_books/demo/shop.py).
const CART_ITEMS = ["Cement 50kg bag", "Iron sheet 3m gauge 30", "Wire nails 3 inch 1kg"];

// The feature rows show each shot about 566 pixels wide, so a full 1280 wide screen would shrink its text
// to under half size. Those shots crop to the part that tells the story; only the hero keeps the viewport.
// Clips are in CSS pixels of the 1280 by 800 viewport.
const MARGIN = 24;

// Each shot: its name (the `-tzs` or `-usd` set is added), the /books route, and how it gets ready and shot.
const SHOTS = [
  {
    name: "home-dashboard",
    route: "/books/",
    // The hero: the full viewport, scrolled so the account balances card and best sellers chart show.
    ready: dashboardReady,
    capture: (page, path) => page.screenshot({ path }),
  },
  {
    name: "home-balances",
    route: "/books/",
    ready: dashboardReady,
    // The box the Books dashboard marks for this shot (so the script never depends on layout classes), with
    // a margin so the cards' edges aren't cut.
    async capture(page, path) {
      const box = await page.locator('[data-shot="home-balances"]').boundingBox();
      const x = Math.max(0, box.x - MARGIN);
      const y = Math.max(0, box.y - MARGIN);
      const clip = { x, y, width: Math.min(1280, box.x + box.width + MARGIN) - x, height: Math.min(800, box.y + box.height + MARGIN) - y };
      await page.screenshot({ path, clip });
    },
  },
  {
    name: "home-pos",
    route: "/books/pos",
    async ready(page) {
      const search = page.getByRole("combobox", { name: "Search by item name, code or barcode" });
      await search.waitFor({ timeout: TIMEOUT });
      for (const item of CART_ITEMS) {
        await search.fill(item);
        await page.getByRole("row", { name: `Add ${item}` }).click({ timeout: TIMEOUT });
      }
      await search.fill("");
      await search.press("Escape");
      await page.getByRole("heading", { name: "Point of Sale" }).click();
      await page.getByText(`Net Total · ${CART_ITEMS.length} items`).waitFor({ timeout: TIMEOUT });
      await page.getByRole("listbox").waitFor({ state: "detached", timeout: TIMEOUT });
      // Item tiles keep each name beside its price, so the crop can drop the left columns.
      await page.getByRole("radio", { name: "Grid view" }).click({ timeout: TIMEOUT });
      await page.waitForTimeout(500);
    },
    // The right three tile columns and the whole cart, below the header (whose shift badge the crop would cut).
    capture: (page, path) => page.screenshot({ path, clip: { x: 352, y: 48, width: 928, height: 752 } }),
  },
  {
    name: "home-stock",
    route: "/books/report/StockBalance",
    async ready(page) {
      // The header row is the first; a second row means the report has data.
      await page.getByRole("table").getByRole("row").nth(1).waitFor({ timeout: TIMEOUT });
      await hideSidebar(page);
    },
    // The title, filters and the item, location, quantity and value columns.
    capture: (page, path) => page.screenshot({ path, clip: { x: 0, y: 0, width: 800, height: 600 } }),
  },
  {
    name: "home-profit",
    // The report has no from and to dates: Until Date with one month counts back from today, so the single
    // column covers the 30 seeded days (spec 0019, Screenshots).
    route: () =>
      `/books/report/ProfitAndLoss?basedOn=Until%20Date&periodicity=Monthly&count=1&toDate=${isoToday()}`,
    async ready(page) {
      await page.getByRole("table").getByText("Income", { exact: true }).first().waitFor({ timeout: TIMEOUT });
      await hideSidebar(page);
    },
    // The title, the date filters and the income and expense rows, down to Total Expense.
    capture: (page, path) => page.screenshot({ path, clip: { x: 0, y: 0, width: 732, height: 760 } }),
  },
];

if (!PASSWORD) {
  console.error("Set BOOKS_SHOTS_PASSWORD to the Administrator password of the two demo sites.");
  process.exit(1);
}

const temp = mkdtempSync(join(tmpdir(), "home-shots-"));
const browser = await chromium.launch();
try {
  for (const [set, url] of Object.entries(SITES)) {
    await captureSite(set, url);
  }
} catch (error) {
  console.error(error.message);
  console.error("No screenshot was moved.");
  process.exitCode = 1;
} finally {
  await browser.close();
}

if (!process.exitCode) {
  mkdirSync(SOURCE, { recursive: true });
  for (const set of Object.keys(SITES)) {
    for (const shot of SHOTS) {
      const file = `${shot.name}-${set}.png`;
      copyFileSync(join(temp, file), join(SOURCE, file));
    }
  }
  await writeOgImage(join(temp, "home-dashboard-usd.png"));
  execFileSync("npm", ["run", "screenshots"], { stdio: "inherit" });
}
rmSync(temp, { recursive: true, force: true });

async function captureSite(set, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  try {
    // The support chat widget would cover part of every shot.
    await context.route(/embed\.tawk\.to/, (route) => route.abort());
    const page = await context.newPage();
    // Sign in from the page: Chromium resolves *.localhost to this machine, Node's own requests don't.
    await page.goto(`${url}/api/method/ping`, { timeout: TIMEOUT });
    const status = await page.evaluate(
      (pwd) =>
        fetch("/api/method/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usr: "Administrator", pwd }),
        }).then((response) => response.status),
      PASSWORD,
    );
    if (status !== 200) throw new Error(`Could not sign in to ${url} (HTTP ${status}).`);

    for (const shot of SHOTS) {
      const route = typeof shot.route === "function" ? shot.route() : shot.route;
      const target = `${url}${route}`;
      try {
        const response = await page.goto(target, { waitUntil: "networkidle", timeout: TIMEOUT });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
        await shot.ready(page);
        if (await page.getByTestId("subscription-banner").count()) {
          throw new Error("a subscription banner is showing; use an unmanaged demo site");
        }
        await shot.capture(page, join(temp, `${shot.name}-${set}.png`));
        console.log(`${shot.name}-${set}: ${target}`);
      } catch (error) {
        throw new Error(`${shot.name}-${set} failed at ${target}: ${error.message.split("\n")[0]}`);
      }
    }
  } finally {
    await context.close();
  }
}

// The account balances card and the best sellers chart, both with data and done animating.
async function dashboardReady(page) {
  const balances = page.locator("div", { has: page.getByText("Account balances", { exact: true }) }).last();
  await balances.scrollIntoViewIfNeeded({ timeout: TIMEOUT });
  await page.getByText("Total", { exact: true }).first().waitFor({ timeout: TIMEOUT });
  await page.getByText(/^Top \d$/).first().waitFor({ timeout: TIMEOUT });
  await page.locator(".animate-pulse").first().waitFor({ state: "detached", timeout: TIMEOUT });
  // Let the donut finish its draw animation.
  await page.waitForTimeout(800);
}

// Reports read better without the Books sidebar, which would take a third of a cropped shot.
async function hideSidebar(page) {
  await page.getByRole("button", { name: "Hide sidebar" }).click({ timeout: TIMEOUT });
  await page.waitForTimeout(500);
}

// Today on this machine, as the report's YYYY-MM-DD route filter wants it.
function isoToday() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
}

// The social card: 1200 by 630, cut from the top of the USD hero shot, as a JPEG under 150 KB (AC-13).
async function writeOgImage(input) {
  mkdirSync("public/og", { recursive: true });
  for (const quality of [82, 74, 66, 58]) {
    const info = await sharp(input)
      .resize({ width: 1200, height: 630, fit: "cover", position: "top" })
      .jpeg({ quality, mozjpeg: true })
      .toFile(OG_IMAGE);
    if (info.size <= 150_000) {
      console.log(`${OG_IMAGE}: ${Math.round(info.size / 1024)} KB`);
      return;
    }
  }
  throw new Error(`${OG_IMAGE} stays over 150 KB even at quality 58.`);
}
