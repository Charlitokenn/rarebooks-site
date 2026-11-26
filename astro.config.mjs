import { webcore } from "webcoreui/integration";
// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
// import node from '@astrojs/node'
import clerk from "@clerk/astro";
import { fileURLToPath } from "node:url";
import { AppConfig } from "./src/constants/index.ts";
import { blogRedirects, retiredCompetitors } from "./src/data/retiredCompetitors.ts";
import rehypeDocsContent from "./src/lib/docs/rehypeDocsContent.ts";

const CLOUDFLARE_WORKERS_STUB = "\0rarebooks:cloudflare-workers-in-node";

// Dev only. Starlight's prerendered catch all route (the docs live at the site root) matches every path, so
// Astro's dev server first loads the matching server route in the Node "prerender" environment just to pick
// the route. A route that imports `cloudflare:workers` at the top (every API route, the dashboard) can't load
// there and the request fails. Give that environment a stand in: the route loads, Astro sees it isn't
// prerendered, and the request runs in workerd with the real module. Reading `env` in Node still throws.
// Builds are untouched (`apply: "serve"`).
const cloudflareWorkersInNodeDev = {
  name: "rarebooks:cloudflare-workers-in-node-dev",
  apply: "serve",
  enforce: "pre",
  resolveId(id) {
    if (id === "cloudflare:workers" && this.environment?.name === "prerender") {
      return CLOUDFLARE_WORKERS_STUB;
    }
  },
  load(id) {
    if (id === CLOUDFLARE_WORKERS_STUB) {
      return `export const env = new Proxy({}, {
  get(_target, key) {
    throw new Error("cloudflare:workers env." + String(key) + " was read in Node during dev; it only exists in workerd.");
  },
});`;
    }
  },
};

// Spec 0024 AC-11: @clerk/astro injects one "page" script into every page, docs included, and it loads Clerk's
// browser script. Point that script's `@clerk/astro/internal` import at src/lib/docs/clerkGuard.ts, which
// loads Clerk only on pages that are not docs pages. Only the page script is redirected: the guard's own
// import, the before hydration script (which runs only on pages with React islands) and the server keep the
// real module.
const CLERK_GUARD = fileURLToPath(new URL("./src/lib/docs/clerkGuard.ts", import.meta.url));
const clerkOffDocs = {
  name: "rarebooks:clerk-off-docs",
  enforce: "pre",
  resolveId(id, importer) {
    if (id === "@clerk/astro/internal" && importer?.includes("astro:scripts/page")) return CLERK_GUARD;
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://rarebooks.cc",
  // Astro 6.4 leaves `markdown.gfm` undefined by default, and @astrojs/mdx 5.0.6 reads undefined as off, so
  // MDX pages lose GFM (tables render as plain `| a | b |` text). Set it explicitly until we move to Astro 7
  // with @astrojs/mdx 8; the deprecation warning it prints is expected.
  // Spec 0024 AC-12: public images get their size and wide tables a tab stop (src/lib/docs/rehypeDocsContent.ts).
  markdown: { gfm: true, rehypePlugins: [rehypeDocsContent] },
  // Spec 0021 AC-10: the old /blog/rarebooks-vs-* posts, each sent straight to its final address in one hop.
  redirects: blogRedirects(retiredCompetitors),
  adapter: cloudflare({
    platformProxy: {
      enabled: process.env.CI !== "true" && process.env.CF_PAGES !== "1",
      persist: false,
    },
    // Disable image processing if not needed
    imageService: "passthrough",
    prerenderEnvironment: "node",
  }),
  integrations: [
    starlight({
      title: "RareBooks",
      // Spec 0024 AC-10: the URLs come from AppConfig.socials; the labels are written here.
      social: [
        { icon: "facebook", label: "Facebook", href: AppConfig.socials.facebook },
        { icon: "instagram", label: "Instagram", href: AppConfig.socials.instagram },
        { icon: "tiktok", label: "TikTok", href: AppConfig.socials.tiktok },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            {
              autogenerate: { directory: "getting-started", collapsed: false },
            },
          ],
        },
        {
          label: "Basics",
          items: [{ autogenerate: { directory: "basics", collapsed: true } }],
        },
        {
          label: "Transactions",
          items: [
            { autogenerate: { directory: "transactions", collapsed: true } },
          ],
        },
        {
          label: "Masters",
          items: [{ autogenerate: { directory: "masters", collapsed: true } }],
        },
        {
          label: "Financial Reports",
          items: [
            {
              autogenerate: { directory: "financial-reports", collapsed: true },
            },
          ],
        },
        {
          label: "Inventory",
          items: [
            { autogenerate: { directory: "inventory", collapsed: true } },
          ],
        },
        {
          label: "Settings",
          items: [{ autogenerate: { directory: "settings", collapsed: true } }],
        },
      ],
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: false,
      },
      favicon: "./src/assets/logo.png",
      // Spec 0024 AC-2: docs.css is the only stylesheet Starlight loads.
      customCss: ["./src/styles/docs.css"],
      // Spec 0024 AC-3 to AC-6: the marketing look on Starlight's own parts. Starlight's sidebar is used as is.
      components: {
        Head: "./src/components/docs/DocsHead.astro",
        Header: "./src/components/docs/DocsHeader.astro",
        MobileMenuFooter: "./src/components/docs/DocsMobileMenuFooter.astro",
        Footer: "./src/components/docs/DocsFooter.astro",
        Pagination: "./src/components/Pagination.astro",
      },
      // Spec 0024 AC-8: GitHub's code colors per theme, with the frame following the --sl-* mapping.
      expressiveCode: {
        themes: ["github-dark", "github-light"],
        useStarlightUiThemeColors: true,
        // Spec 0024 AC-12: wrap long lines rather than scroll. A block that scrolls sideways gets an unnamed
        // `role="region"` from Expressive Code, and two of them on one page fail axe's landmark-unique.
        defaultProps: { wrap: true },
      },
      disable404Route: true,
      plugins: [],
    }),
    webcore(),
    react(),
    // Spec 0023 AC-11: the UserButton on /welcome signs out to the homepage.
    clerk({ afterSignOutUrl: "/" }),
  ],
  output: "server",
  vite: {
    plugins: [cloudflareWorkersInNodeDev, clerkOffDocs, tailwindcss()],
    define: {},
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});