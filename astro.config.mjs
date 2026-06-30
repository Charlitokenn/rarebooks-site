import { webcore } from "webcoreui/integration";
// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import cloudflare from "@astrojs/cloudflare";
// import netlify from '@astrojs/netlify';
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
// import node from '@astrojs/node'
import clerk from "@clerk/astro";

// https://astro.build/config
export default defineConfig({
  // adapter: netlify(),
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: false,
    },
    // Disable image processing if not needed
    imageService: "passthrough",
  }),
  // adapter: node({ mode: 'standalone' }),
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
        src: "/logo.png",
        replacesTitle: false,
      },
      customCss: [
        // Path to your Tailwind base styles:
        "./src/styles/global.css",
      ],
      components: {
        Sidebar: "./src/components/Sidebar.astro",
        Pagination: "./src/components/Pagination.astro",
      },
      disable404Route: true,
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