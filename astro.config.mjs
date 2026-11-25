import { webcore } from "webcoreui/integration";
// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
// import node from '@astrojs/node'
import clerk from "@clerk/astro";
import starlightBlog from 'starlight-blog'
import { blogRedirects, retiredCompetitors } from "./src/data/retiredCompetitors.ts";

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

// https://astro.build/config
export default defineConfig({
  site: "https://rarebooks.cc",
  // Astro 6.4 leaves `markdown.gfm` undefined by default, and @astrojs/mdx 5.0.6 reads undefined as off, so
  // MDX pages lose GFM (tables render as plain `| a | b |` text). Set it explicitly until we move to Astro 7
  // with @astrojs/mdx 8; the deprecation warning it prints is expected.
  markdown: { gfm: true },
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
      social: [
        {
          icon: "facebook",
          label: "Facebook",
          href: "https://facebook.com/rarebooks",
        },
        {
          icon: "instagram",
          label: "Facebook",
          href: "https://instagram.com/rarebooks",
        },
        {
          icon: "tiktok",
          label: "TikTok",
          href: "https://tiktok.com/@rarebooks_",
        },
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
      customCss: [
        // Path to your Tailwind base styles:
        "./src/styles/global.css",
      ],
      components: {
        Sidebar: "./src/components/Sidebar.astro",
        Pagination: "./src/components/Pagination.astro",
      },
      disable404Route: true,
      plugins: [],
    }),
    webcore(),
    react(),
    clerk(),
  ],
  output: "server",
  vite: {
    plugins: [cloudflareWorkersInNodeDev, tailwindcss()],
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