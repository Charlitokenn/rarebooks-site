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
  site: "rarebooks-marketing-site.nkonoki-charles.workers.dev",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: false,
    },
    // Disable image processing if not needed
    imageService: "passthrough",
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
      plugins: [
          starlightBlog({
            title: "Blog | RareBooks",
            postCount: 10,
            recentPostCount: 5,
            metrics: {
              readingTime: true,
              words: 'rounded'
            },
            authors: {
              owner: {
                name: "Charles Nkonoki",
                title: "Founder",
                picture: "/developer.jpg",
                url: "https://tz.linkedin.com/in/charles-nkonoki"
              }
            },
            rss: false,
          })
      ],
    }),
    webcore(),
    react(),
    clerk(),
  ],
  output: "server",
  vite: {
    plugins: [tailwindcss()],
    define: {},
    resolve: {
      alias: [
        {
          find: "@bruits/satteri-wasm32-wasi",
          replacement: "satteri/satteri_napi.wasi-browser.js",
        },
      ],
    },
    ssr: {
      external: ["satteri"],
    },
    build: {
      rollupOptions: {
        external: ["@bruits/satteri-wasm32-wasi", "satteri"],
      },
    },
    optimizeDeps: {
      exclude: ["satteri"],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});