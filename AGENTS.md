# RareBooks marketing site (rarebooks-site)

The public site at `rarebooks.cc`: marketing pages, compare and alternatives pages, the pricing page, the Starlight user docs, Clerk sign in, and the sign up reception page at `/welcome` (old `/dashboard` links redirect there, spec 0023). It is one Astro app served by one Cloudflare Worker.

## Stack

- **Language / Runtime**: TypeScript 5.9 (strict, `astro/tsconfigs/strict`), Cloudflare Workers runtime (`nodejs_compat`)
- **Framework**: Astro 6 with `output: "server"` and `@astrojs/cloudflare`, React 19 islands, Starlight plus `starlight-blog` for `/docs` content
- **Key dependencies**: `@clerk/astro` and `@clerk/backend` (auth), Cloudflare D1 (`DB`) and KV (`SESSION`), Resend plus React Email (mail), Tailwind 4 with shadcn (`radix-mira` style, Hugeicons) and webcoreui, ClickPesa (TZS payments)
- **Package manager**: npm (`package-lock.json` is committed; Cloudflare installs with `npm clean-install`, so keep the lockfile in sync with `package.json`)

## Build approach

Tracer Bullet: each feature is built end to end and works before the next starts. Source: the scope file in the sibling `rarebooks-web` repo (`docs/scope/scope.md`).

## Commands

```bash
# Install
npm install

# Dev server (Astro with the Workers platform proxy, so D1 and KV bindings work locally)
npm run dev

# Typecheck (astro check; there is no lint yet)
npm run check

# Unit tests (node --test over tests/**/*.test.ts)
npm test

# Screenshots: resize the sources in src/assets/screenshots/source/, or capture the homepage shots from two served demo shop sites
npm run screenshots
BOOKS_SHOTS_PASSWORD=<admin password> npm run screenshots:home

# Build, then build and deploy to Cloudflare
npm run build
npm run flare:deploy

# D1 migrations
npx wrangler d1 migrations apply rarebooks --remote
```

## Specs

Specs are not stored here. They live in the sibling `rarebooks-web` repo (`docs/specs/`); specs 0014 and 0016 (sign up), 0017 to 0022 (marketing redesign), 0023 (welcome page) and 0024 (docs restyle) cover this repo.

## Rules

- Server code reads bindings and secrets with `import { env } from "cloudflare:workers"`, never `process.env`. Add a new binding or secret to `wrangler.toml` (or `wrangler secret put`) and to `worker-configuration.d.ts`.
- Every API route and server rendered page sets `export const prerender = false`; routes answer JSON with `{ message }` on errors.
- Identity comes from Clerk on the server (`Astro.locals.currentUser()`, `locals.auth()`, or `@clerk/backend`), never from a form field. `/welcome(.*)` is protected in `src/middleware.ts`.
- Link to `/welcome`, never `/dashboard`; `tests/welcome/no-dashboard-links.test.ts` fails on one (spec 0023 AC-12).
- Marketing pages and the docs build to the `mk` design system in [src/components/marketing/README.md](src/components/marketing/README.md): tokens only in `src/styles/mk-tokens.css`, `docs.css` the only Starlight `customCss`, no scripts on docs pages (specs 0017, 0024).
- Visitor country comes from `locals.countryCode` (set in the middleware from `cf-ipcountry`); `isTanzania()` in `src/constants/pricing.ts` picks local (TZS) or international (USD) pricing.
- Import with the path aliases `@components/*`, `@assets/*`, `@blocks/*` and `@stores/*`. shadcn components go in `src/components/components/ui` (see `components.json`).
- App wide constants (names, emails, URLs, product ids, prices) live in `src/constants/`, not in components.
- Email bodies are React Email components in `src/components/templates/`, rendered with `@react-email/render` and sent through Resend from `nonreply@rarebooks.cc`.
- User docs are `.mdx` files in `src/content/docs/<section>/`; each section folder needs its own `autogenerate` entry in the Starlight `sidebar` in `astro.config.mjs`, or its pages don't show in the sidebar.
- TypeScript: double quotes, semicolons, 2 space indent.
- `tests/onboarding/signing_vectors.json` must stay byte for byte identical to the copies in `rarebooks-web` (`frappe_books/tests/`) and `rarebooks_control` (`rarebooks_control/tests/`), and `tests/onboarding/email_key_cases.json` to the one in `rarebooks_control`. Change them together (spec 0014 AC-8, AC-9).

## Agent skills

- [clerk-astro-patterns](.agents/skills/clerk-astro-patterns/): `clerk/skills`, Clerk in Astro (middleware, SSR, islands)
- [clerk-backend-api](.agents/skills/clerk-backend-api/): `clerk/skills`, server side user reads and writes with `@clerk/backend`
- [clerk-setup](.agents/skills/clerk-setup/), [clerk](.agents/skills/clerk/): `clerk/skills`, Clerk setup and the index of Clerk skills
- [clerk-custom-ui](.agents/skills/clerk-custom-ui/): `clerk/skills`, sign in and sign up appearance and custom flows
- [clerk-webhooks](.agents/skills/clerk-webhooks/), [clerk-testing](.agents/skills/clerk-testing/): `clerk/skills`, Clerk webhooks and auth in tests
- [workers-best-practices](.agents/skills/workers-best-practices/): `cloudflare/skills`, production Worker code and config
- [wrangler](.agents/skills/wrangler/), [workers-development](.agents/skills/workers-development/): `cloudflare/skills`, wrangler commands (D1, KV, secrets, deploy) and local debugging
- [frameworks-on-cloudflare](.agents/skills/frameworks-on-cloudflare/), [cloudflare](.agents/skills/cloudflare/): `cloudflare/skills`, Astro on Workers and picking Cloudflare products
- [turnstile-spin](.agents/skills/turnstile-spin/): `cloudflare/skills`, Turnstile with server side Siteverify (spec 0014)

Declined: resend/resend-skills
MCP servers: Cloudflare API MCP `https://mcp.cloudflare.com/mcp` (recommended), Clerk MCP `https://mcp.clerk.com/mcp` (recommended), Astro Docs MCP `https://mcp.docs.astro.build/mcp` (recommended), shadcn MCP `npx shadcn@latest mcp` (recommended)

## Context files

- [src/components/marketing/AGENTS.md](src/components/marketing/AGENTS.md): the `mk` design system components, the site chrome and the docs look (specs 0017, 0018, 0024)
- [src/pages/api/AGENTS.md](src/pages/api/AGENTS.md): the server API routes, their outside services (Clerk, Resend, ClickPesa, D1, the control site) and gotchas

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
