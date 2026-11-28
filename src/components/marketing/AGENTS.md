# src/components/marketing (marketing design system)

## Overview

The `mk` Astro components every redesigned marketing page builds on, the site chrome (`MkNav`, `MkFooter`) and, with `src/components/docs/`, the docs look. The full guide, with every token, allowed color pair and component prop, is [README.md](README.md). Read it before you add or change a marketing or docs page.

## Key files

| File | Owns |
|---|---|
| `README.md` | The design system guide: rules, tokens, allowed pairs, components, site chrome (specs 0017, 0018, 0024) |
| `Mk*.astro` | The shared parts: `MkSection` bands, `MkHeading`, `MkButton`, cards, badges, lists, FAQ, screenshot frame and feature row, logo, nav, footer |
| `home/`, `pricing/`, `compare/` | Page sections for the homepage (spec 0019), `/pricing` (spec 0020) and the compare and alternatives pages (spec 0021) |
| `../../styles/mk-tokens.css`, `mk-fonts.css`, `marketing.css`, `docs.css` | Tokens, the Fraunces faces, the marketing rules and the Starlight docs styles |
| `../../constants/navigation.ts` | Every nav and footer link, nowhere else |
| `../../data/screenshots.json` | The screenshot manifest `MkScreenshotFrame` reads, written by `npm run screenshots` |

## Commands

```bash
npm test                 # includes tests/marketing/ and tests/docs/ (contrast pairs, head snapshot, no scripts, load speed)
npm run screenshots      # resize new sources in src/assets/screenshots/source/ into public/screenshots/
node scripts/font-fallback.mjs   # when the Fraunces files change, paste its output into the fallback faces
```

## Conventions

- An `mk` color value is written only in `mk-tokens.css`, a Fraunces face only in `mk-fonts.css`; everything else references `var(--color-mk-*)`. Every text and background pair must be an allowed pair, held by `tests/marketing/contrast.test.ts` and `tests/docs/contrast.test.ts`.
- Don't edit `global.css`, `fonts.css` or `WelcomeLayout.astro`: `/welcome` keeps the old look.
- Components ship no client JavaScript, except the two small inline scripts the README names (the `MkNav` phone menu, `HomeDemoDialog`).
- Each marketing page renders `MkNav` first and `MkFooter` last, with its own `<main id="main">`; `Layout.astro` adds neither.
- Docs pages stay prerendered with no third party scripts, no Clerk and no `client:` islands; `tests/docs/docs-head.test.ts` checks every docs URL, title and canonical against `tests/docs/docs-head-snapshot.json`.

_Drafted by /sync from the introducing change, worth a quick human pass._
