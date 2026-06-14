import { webcore } from 'webcoreui/integration';
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import cloudflare from '@astrojs/cloudflare';
// import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import { loadEnv } from 'vite';
const { KEYMINT_API_KEY } = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
    // adapter: netlify(),
    adapter: cloudflare({
        platformProxy: {
            enabled: true
        },
        // Disable image processing if not needed
        imageService: 'passthrough'
    }),
  integrations: [starlight({
      title: 'RareBooks',
      social: [
          { icon: 'facebook', label: 'Facebook', href: 'https://github.com/withastro/starlight' },
          { icon: 'instagram', label: 'Facebook', href: 'https://github.com/withastro/starlight' },
          { icon: 'tiktok', label: 'TikTok', href: 'https://tiktok.com/@rarebooks_' }
      ],
      sidebar: [
          { label: 'Getting Started', items: [{ autogenerate: { directory: 'getting-started', collapsed: false } }] },
          { label: 'Basics', items: [{ autogenerate: { directory: 'basics', collapsed: true } }] },
          { label: 'Financial Reports', items: [{ autogenerate: { directory: 'financial-reports', collapsed: true } }] },
          { label: 'Inventory', items: [{ autogenerate: { directory: 'inventory', collapsed: true } }] },
          { label: 'Masters', items: [{ autogenerate: { directory: 'masters', collapsed: true } }] },
          { label: 'Settings', items: [{ autogenerate: { directory: 'settings', collapsed: true } }] },
          { label: 'Transactions', items: [{ autogenerate: { directory: 'transactions', collapsed: true } }] },
      ],
      logo: {
          src: './src/assets/logo.png',
          replacesTitle: false,
      },
      customCss: [
          // Path to your Tailwind base styles:
          './src/styles/global.css',
      ],
      // defaultLocale: 'en',
      // locales: {
      //     en: {
      //         label: 'English',
      //     },
      // },
      components: {
          Sidebar: './src/components/Sidebar.astro',
          Pagination: './src/components/Pagination.astro',
      },
      disable404Route: true,
  }), webcore(), react()],

  vite: {
    plugins: [tailwindcss()], 
    define: {
        'import.meta.env.KEYMINT_API_KEY': JSON.stringify(KEYMINT_API_KEY),
    },
    css: {
          preprocessorOptions: {
              scss: {
                  api: 'modern-compiler'
              }
          }
      }
  },
});