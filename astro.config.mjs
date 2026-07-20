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

// https://astro.build/config
export default defineConfig({
  site: "https://rarebooks.cc",
  redirects: {
    "/blog/rarebooks-vs-gnucash": "/compare/gnucash",
    "/blog/rarebooks-vs-busy-accounting": "/compare/busy-accounting",
    "/blog/rarebooks-vs-manager-io": "/compare/manager-io",
    "/blog/rarebooks-vs-quickbooks-desktop": "/compare/quickbooks-desktop",
    "/blog/rarebooks-vs-reach-accountant": "/compare/reach-accountant",
    "/blog/rarebooks-vs-sage-50": "/compare/sage-50",
    "/blog/rarebooks-vs-tallyprime": "/compare/tallyprime",
    "/blog/rarebooks-vs-turbocash": "/compare/turbocash",
    "/blog/rarebooks-vs-wings-accounting": "/compare/wings-accounting",
  },
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
    plugins: [tailwindcss()],
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