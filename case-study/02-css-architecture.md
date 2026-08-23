# CSS Architecture

## Two layers, two jobs

[`globals.css`](../src/app/globals.css) is three lines:

```css
@import url("https://fonts.googleapis.com/css2?family=Fraunces...");
@import "tailwindcss";
@import "./styles/style-guide.css";
```

That import order is the whole architecture in miniature:

1. **Tailwind v4** supplies plumbing — layout utilities (`flex`, `min-h-full`,
   `mt-5`), one-off spacing, and the `@theme inline` bridge that exposes the
   brand's CSS custom properties as Tailwind utilities (`bg-abyss`,
   `text-copper`). It is not the design system.
2. **[`style-guide.css`](../src/app/styles/style-guide.css)** — one
   hand-authored stylesheet (~2,500 lines) — is the actual design system.
   Every component-level class (`.print-card`, `.hero`, `.trade-segment`,
   `.added-panel`) lives here, hand-tuned against the brand tokens from
   [01-brand-and-design-tokens.md](01-brand-and-design-tokens.md).

The split matters in practice: reach for a Tailwind utility for structural,
one-off layout (`flex`, `gap-4`, `mt-5`); add a class to `style-guide.css`
for anything that represents a reusable visual pattern (a card, a button
variant, a panel). Mixing the two per-component — Tailwind utilities
scattered across every file for things that repeat — is what this
architecture is deliberately avoiding.

## Naming convention

BEM-flavored, not strict BEM:

```
.print-card                  block
.print-card__cart-btn        element
.print-card__cart-btn.is-in-cart   state modifier
```

- **Blocks** are the component root (`.print-card`, `.added-panel`,
  `.trade-segment`).
- **Elements** use `__` (`.added-panel__item-add`, `.event-card__overlay`).
- **State** is a separate class, always `is-*`, added/removed by JS rather
  than baked into a BEM modifier (`.option-pill.is-selected`,
  `.print-card__cart-btn.is-in-cart`, `.reveal.is-visible`). This keeps the
  base class's styling and the state's styling independently readable in the
  stylesheet — search for `.is-in-cart` and every place that state is styled
  shows up, regardless of which block it's attached to.
- A few older/shared primitives break the pattern intentionally
  (`.btn`/`.btn-primary`/`.btn-outline` are hyphenated, not BEM, because
  they're used as composable utility-ish classes, not a single block).

## Scoping discipline

Every component owns its own CSS block, in source order, with a one-line
comment header (`/* Print shop grid (category pages) */`,
`/* Lightbox */`, `/* Added-to-cart panel — ... */`). This is what keeps a
"make the trade page nicer" request from bleeding into unrelated pages: a
change to `.trade-segment` can't accidentally affect `.print-card` because
there's no shared parent selector or inherited class between them — even
though they're visually similar (both are card-shaped, bordered blocks),
they're deliberately separate class trees.

When you're about to restyle something, `grep` for the exact class name
first and check what else uses it before changing shared rules like `.btn`
or `.eyebrow` — those genuinely are shared across many pages, and a "quick
fix" there has the widest blast radius in the stylesheet.

## Reusable structural patterns worth knowing before adding new ones

- **`.wrap`** — the page-width container (`max-width: 1080px`, side
  padding). Every section's content sits inside one.
- **`section` / `section.tight`** — vertical rhythm. Default sections get
  120px top/bottom padding; `.tight` sections get 80px. Pick based on
  whether the section is a hero-weight moment or a denser follow-on section.
- **`.print-grid` / `.print-grid--scroll`** — the same card grid, either
  wrapped (`auto-fill` grid) or as a horizontal scroll-snap row. The
  `--scroll` variant is a single additional class on the same markup, not a
  separate component — see `PrintGrid.tsx`, which renders one grid and lets
  the caller decide via `className`.
- **`.eyebrow`** — the small caps label above headings, used consistently
  from the hero down to `.added-panel__recs-label`. If a new section needs a
  small uppercase label, reuse this class rather than writing a new one.

## Known rough edge

Spacing is mostly raw pixel values rather than the `--space-*` scale (see
[01-brand-and-design-tokens.md](01-brand-and-design-tokens.md)). It doesn't
cause visible inconsistency today because values were chosen by eye against
the existing rhythm, but a project with more than one person touching CSS
would benefit from enforcing the scale rather than eyeballing pixel values
per component.
