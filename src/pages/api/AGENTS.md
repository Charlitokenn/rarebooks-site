# src/pages/api (server API routes)

## Overview

The Worker's JSON endpoints, called by the React islands on the marketing pages and the welcome page. They hold every call to an outside service: Clerk (users), Resend (mail), ClickPesa (payment methods), D1 and the RareBooks control site (the `onboarding/` routes, spec 0014). The desktop license key routes and Keymint are gone (spec 0014 AC-7).

## Key files

| File | Owns |
|---|---|
| `payment-methods.ts` | Lists ClickPesa payment methods (token first, then the methods call) |
| `onboarding/check-subdomain.ts`, `onboarding/signup.ts`, `onboarding/status.ts` | The hosted sign up (spec 0014 AC-2 to AC-4): the live subdomain check, the Turnstile checked sign up, and the status the welcome page polls. Owner identity comes from Clerk (`src/lib/onboarding/owner.ts`) |
| `onboarding/notify.ts` | The control site's signed Ready or Failed notice, which sends the matching Resend email once (spec 0014 AC-6) |
| `../../lib/onboarding/` | Shared by these routes, `src/pages/welcome/` and `src/components/onboarding/`: HMAC signing, the signed control site calls, the `email_key` rule, the `ONBOARDING_KV` counters, the D1 `signups` table and Turnstile Siteverify |

## Conventions

- Each route reads the raw body with `request.text()` and parses JSON itself (some also accept form posts), answering 400 `{ message }` on bad JSON.
- Secrets used here: `RESEND_API_KEY`, `CLICKPESA_CLIENT_ID`, `CLICKPESA_API_KEY`, `CONTROL_SIGNING_SECRET` (the control site's `marketing_secret`), `TURNSTILE_SECRET_KEY`; Clerk keys are read by `@clerk/astro` and `@clerk/backend`. Never log them.

## Gotchas

- The D1 tables `redemptionCodes` and `sumolings` (AppSumo users) are not in `migrations/` and no route reads them any more; `migrations/` creates `trials` (dropped again by `0004`, export it first) and `signups` (`0003`). Check the remote database (`npx wrangler d1 execute rarebooks --remote --command ".tables"`) before you change them.
- `migrations/0000_create_trials_table.sql` and `0001_create_trials_table.sql` both create `trials`; `0002` adds `subscription_amount`.

## Related specs

- `rarebooks-web` spec 0014 (self serve onboarding): adds the onboarding routes and removes the license routes
- `rarebooks-web` spec 0016 (release a sign up): a D1 row is dropped only on a signed 404 for its request (`src/lib/onboarding/earlier.ts`)
- `rarebooks-web` spec 0022 (load speed): removes the Contact us form and its `contact-us.ts` route; Contact us opens the chat

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
