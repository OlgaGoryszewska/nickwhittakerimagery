# Brand & Design Tokens

## Source material

The palette is sourced directly from the subject matter: deep abyss-navy
water, silver foam, one warm copper accent — pulled from
[@nickwhittaker.oceanimagery](https://www.instagram.com/nickwhittaker.oceanimagery/),
the photographer's own Instagram (Ocean | Water photography, Auckland, NZ).
The brand isn't an invented identity layered on top of the photos; it's
extracted from them, which is why the UI reads as quiet and gets out of the
photography's way.

## Color palette

Defined once as CSS custom properties in
[`src/app/styles/style-guide.css`](../src/app/styles/style-guide.css), under
`:root`:

| Token | Value | Use |
| --- | --- | --- |
| `--foam` | `#f5f2ea` | Primary background — warm off-white, not pure white |
| `--paper` | `#ece6d8` | Secondary background (selected states, cards) |
| `--ink` | `#1a1d1e` | Primary text, dark UI elements |
| `--abyss` | `#0a1620` | Darkest navy — hero overlays, primary buttons |
| `--abyss-2` | `#0f2530` | Secondary dark navy (gradients) |
| `--teal` | `#1d4e5c` | Secondary text, links |
| `--tide` | `#3e7e8c` | Eyebrow labels, hover accents |
| `--copper` | `#d69a52` | The one warm accent — used sparingly |
| `--copper-dark` | `#b87b36` | Copper for text/hover states (better contrast than `--copper`) |
| `--silver` | `#c7cfcc` | Muted text on dark backgrounds, borders |
| `--line` | `#dcd5c4` | Hairline borders, dividers |

`--copper` is deliberately the only saturated color in the system. Every
other token is a desaturated navy, foam, or silver. When a new UI element
needs to draw the eye — a badge, a CTA underline, a success indicator — reach
for `--copper-dark` before introducing a new color.

These tokens are also exposed to Tailwind's utility classes via `@theme
inline` in the same file (`--color-foam`, `--color-abyss`, etc.), so
`bg-abyss` or `text-copper` work as Tailwind utilities without duplicating
the palette in a `tailwind.config`.

## Typography

Two typefaces, loaded via a Google Fonts `@import` at the top of
[`src/app/globals.css`](../src/app/globals.css) (must stay the first rule in
the file — `@import` rules are only valid before other CSS):

- **Fraunces** (`--font-display`) — a serif with wide optical-size range,
  used for headings and any "considered" copy (the home page's `<em>light</em>`
  in the hero, pull quotes). Its italic is used for lede paragraphs
  (`.home-about__lede`, `.section-head p`) to give body copy an editorial
  voice without switching typeface.
- **Jost** (`--font-body`) — a geometric sans, used for everything else:
  nav, buttons, form labels, prices.

**Known loose end:** [`layout.tsx`](../src/app/layout.tsx) still loads
`Geist`/`Geist_Mono` via `next/font/google` and applies their CSS variables
to `<html>` — leftover from the `create-next-app` scaffold. Nothing in
`style-guide.css` references `--font-geist-sans` or `--font-geist-mono`; the
actual typefaces are Fraunces/Jost via the `@import` above. Safe to delete
the Geist imports from `layout.tsx` next time that file is touched.

## Spacing scale

A 4px-based scale, also defined in `:root`:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 16px;
--space-4: 24px;
--space-5: 32px;
--space-6: 48px;
--space-7: 64px;
```

In practice, most component CSS uses raw pixel values rather than these
variables (e.g. `padding: 48px` on `.card-feature` rather than
`var(--space-6)`). The scale exists as a reference for "does this fit an
existing step" more than as a strictly enforced system — worth tightening if
this pattern is reused on a project with more contributors.

## Logo

`public/nick-logo.svg` — a wordmark with a signature-style flourish, used in
the header (`Header.tsx`) and referenced directly (not as a design token) in
the `Organization` JSON-LD in `layout.tsx`.
