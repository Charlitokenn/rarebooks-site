# Marketing design system

The shared look of the redesigned marketing pages (spec 0017 in `rarebooks-web/docs/specs/`). You get one set of `mk` tokens in `src/styles/marketing.css` and the Astro components in this folder. You can see every token and component live at `/design-system` (not indexed, and no page links to it).

`Layout.astro` loads `marketing.css`, which imports `global.css` first and adds the `mk` system on top. `/dashboard` and the docs load `global.css` directly, so nothing here changes them.

## Rules (Key invariants)

- Don't edit `global.css`, `fonts.css`, `WelcomeLayout.astro` or the Starlight `customCss`. Anything new for marketing goes in `marketing.css`.
- `marketing.css` adds one page wide rule, `scroll-padding-top: 5rem` on `html`. Every other rule is scoped to `.mk-band` or `[data-tone]`, so a page keeps its current look until you rebuild it with `MkSection`.
- New marketing code uses only `mk` tokens. The old names (`brand`, `ink`, `muted`, `display`, `pill`, `soft`, `card`) stay only where current pages use them, and each restyle removes them from the pages it rewrites.
- Every color token is a 6 digit hex value, and any text and background pair you use on a page is in the allowed pairs below. `npm test` (`tests/marketing/contrast.test.ts`) holds them.
- Components ship no client JavaScript, with two exceptions, each one inline script of under 1 KB: MkNav's, for the phone menu's close rules (spec 0018 AC-12), and the homepage's `HomeDemoDialog`, which shows the Watch the demo button, loads the Arcade iframe only when the dialog opens and removes it on close (spec 0019 AC-6). An interaction that truly needs JS (the pricing toggle) is a React island styled with `mk` classes.
- `mk-pink-strong` and `mk-border` are decoration only: never the only sign of a control, never behind text.
- Light only: no `.dark` rules in `marketing.css`.

## Tokens

All in the `@theme static` block of `marketing.css`, so Tailwind classes work (`bg-mk-canvas`, `text-mk-h2`, `rounded-mk-card`).

| Group | Tokens | Classes |
|---|---|---|
| Colors | `mk-canvas` `mk-surface` `mk-ink` `mk-subtle` `mk-brand` `mk-brand-strong` `mk-tint` `mk-pink` `mk-pink-strong` `mk-border` `mk-on-dark` `mk-on-dark-subtle` `mk-focus` `mk-focus-on-dark` | `bg-mk-*`, `text-mk-*`, `border-mk-*` |
| Fonts | `mk-serif` (Fraunces, display to h2), `mk-sans` (Plus Jakarta Sans) | `font-mk-serif`, `font-mk-sans` |
| Type scale | `mk-display` `mk-h1` `mk-h2` `mk-h3` `mk-lead` `mk-body` `mk-small` `mk-overline` (each carries line height, weight and, where set, letter spacing) | `text-mk-*`; add the family yourself, or use `MkHeading` |
| Widths | `mk` (75rem), `mk-narrow` (48rem) | `max-w-mk`, `max-w-mk-narrow` |
| Radii | `mk-pill` `mk-sm` `mk-card` `mk-frame` | `rounded-mk-*` |
| Shadows | `mk-card` `mk-frame` | `shadow-mk-*` |
| Motion | `mk` ease, 150 ms | `motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-mk` |

Spacing is Tailwind's own scale, set inside the components: band padding `py-16 md:py-28`, side gutter `px-5 md:px-8`, feature rows `gap-16 md:gap-24`.

**Allowed pairs** (text and background): `mk-ink`, `mk-subtle` and `mk-brand` on `mk-canvas`, `mk-surface`, `mk-tint` and `mk-pink`; `mk-on-dark` on `mk-brand`, `mk-brand-strong` and `mk-ink`; `mk-on-dark-subtle` on `mk-ink`; `mk-ink` on `mk-on-dark`. UI parts (3:1): `mk-focus` on the light backgrounds, `mk-focus-on-dark` and `mk-pink-strong` on `mk-ink`.

**Forbidden**: `mk-brand` on `mk-ink` (2.9:1). On the ink band, use the `on-dark` button variants; the overline, underline, check icons and focus ring switch on their own.

**Band values.** Inside an `MkSection`, components read `--mk-focus`, `--mk-overline`, `--mk-underline`, `--mk-check`, `--mk-subtle` and `--mk-link`, set per band. Write `text-(--mk-subtle)` for secondary text that must work on every band. Add `mk-on-light` or `mk-on-dark` to a surface to reset those values inside it (a white card on ink, a solid quote card on a light band).

**Fonts.** Set `preloadSerif` on `Layout` for a page with a display or h1 heading above the fold. Run `node scripts/font-fallback.mjs` and paste its output into the fallback faces if the Fraunces files change.

## Components

### MkSection

A full width band. Props: `tone` (`canvas` | `ink` | `tint` | `pink`, default `canvas`), `width` (`default` | `narrow`), `as` (`section` | `div` | `footer` | `aside`), `id`, `labelledby` (the heading's `id`, so the region gets a name), `padding` (replaces the default `py-16 md:py-28`), `class`.

```astro
<MkSection tone="tint" labelledby="why">
  <MkHeading level={2} id="why">Why RareBooks</MkHeading>
</MkSection>
```

### MkHeading

Optional overline above a heading. Props: `level` (1 | 2 | 3), `size` (`display` | `h1` | `h2` | `h3`, defaults to the level), `overline`, `align` (`start` | `center`), `id`, `class`. The slot may hold one `MkHighlight`.

```astro
<MkHeading level={1} size="display" overline="Accounting">
  Books that feel <MkHighlight>simple</MkHighlight>
</MkHeading>
```

### MkHighlight

The one italic word of a headline, with a hand drawn underline (decorative, colored by the band). No props.

```astro
Know what <MkHighlight>sells</MkHighlight>
```

### MkButton

A pill button, or an `<a>` when `href` is set. Props: `variant` (`primary` | `secondary` for light bands, `on-dark` | `secondary-on-dark` for the ink band, `link` for an inline link), `size` (`md` 44 px | `lg` 52 px), `href`, `type` (`button` default), `class`. Other attributes (`data-open-modal`, `data-cta-*`, `target`, `rel`, `aria-*`) pass through.

```astro
<MkButton href="/auth/sign-up" size="lg" data-cta-location="hero">Start free trial</MkButton>
```

### MkCard

Props: `variant` (`plain` | `quote`), `tone` (quote only: `brand` | `pink` | `ink`), `as` (`div` | `article` | `li` | `figure`), `class`. A quote card takes a `cite` slot.

```astro
<MkCard variant="quote" tone="pink">
  I finally see my cash every morning.
  <span slot="cite"><strong>Joseph</strong>, pharmacy</span>
</MkCard>
```

### MkBadge

A small pill label. Props: `tone` (`brand` | `pink` | `ink`), `class`.

```astro
<MkBadge tone="brand">Most popular</MkBadge>
```

### MkCheckList

A list with a check icon per item. Props: `items` (`string[]`), `class`.

```astro
<MkCheckList items={["Unlimited invoices", "Mobile money accounts"]} />
```

### MkFaq

Native `<details>` rows, no JavaScript. Props: `items` (`{ question, answer }[]`; `answer` is trusted HTML we write, never visitor input), `class`. Put an `MkHeading` above it to name the FAQ.

```astro
<MkFaq items={[{ question: "Can I use it on my phone?", answer: "Yes, in any browser." }]} />
```

### MkScreenshotFrame

A product screenshot in a rounded frame with a browser bar. Props: `name` (a key in `src/data/screenshots.json`), `alt`, `sizes` (default `(min-width: 1200px) 1200px, 100vw`), `priority` (eager and high priority, for the one image above the fold), `class`.

To add a screenshot, put a PNG or JPG in `src/assets/screenshots/source/`, run `npm run screenshots`, and commit the source, `public/screenshots/` and the JSON.

```astro
<MkScreenshotFrame name="sample-dashboard" alt="The RareBooks dashboard" priority />
```

### MkFeatureRow

Text beside a screenshot: two columns from `md`, the frame on the right unless `reverse`; text first on phones. Props: `screenshot` (`{ name, alt, sizes?, priority? }`), `reverse`, `class`. Slots: `overline`, `title` (rendered as an h3), and the default slot for text and buttons.

```astro
<MkFeatureRow screenshot={{ name: "sample-dashboard", alt: "Account balances" }}>
  <span slot="title">See where your money is</span>
  <p>Every account on one screen.</p>
  <MkButton href="/auth/sign-up">Start free trial</MkButton>
</MkFeatureRow>
```

## Site chrome (spec 0018)

Every marketing page renders `MkNav` first and `MkFooter` last, and gives its own `<main>` the `id="main"` the skip link targets. `Layout.astro` adds neither. The auth pages and `/design-system` leave both out. The links live in `src/constants/navigation.ts`, nowhere else.

### MkLogo

The logo image (`alt=""`) and the name in Fraunces, as one static link. Props: `href` (default `/`), `class`. The dashboard sidebar keeps `AppLogo.tsx`.

```astro
<MkLogo />
```

### MkNav

No props. Renders the skip link, the 64 px sticky header (`z-40`), the four `navLinks`, and on the right Sign in plus Start free trial, or one Dashboard button for a signed in visitor. The choice is made on the server from `Astro.locals.auth()` (a missing or failing `auth` counts as signed out). Below `md` it shows a Menu button that opens a `<dialog id="mk-nav-menu">` sheet through the Layout `data-open-modal` handler. Its inline script closes the sheet on a backdrop tap, a link tap and a resize to `md`. Compare gets `aria-current` on `/compare` pages.

```astro
<MkNav />
<main id="main">…</main>
```

### MkFooter

No props. The four `footerColumns` (Product, Compare, Resources, and Legal once `AppConfig.legal.approved` is true), links filtered by sign in state, then the logo, `AppConfig.description`, the social icons and the copyright year from the server clock.

```astro
<MkFooter />
```

### MkSocialIcon

A 24 px inline SVG, `aria-hidden`. Props: `name` (`facebook` | `instagram` | `tiktok`), `class`. Put the name on the link around it.

```astro
<a href={AppConfig.socials.facebook} aria-label="RareBooks on Facebook"><MkSocialIcon name="facebook" /></a>
```
