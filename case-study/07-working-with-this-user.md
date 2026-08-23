# Development Workflow

How changes get verified and scoped on this project — conventions worth
following if you're picking this codebase up, whether that's a human
contributor or another AI session.

## The verification loop

Nearly every non-trivial change in this project follows the same sequence
before being considered done:

1. **Read the relevant docs for this exact version first** — for anything
   Next.js-shaped, check `node_modules/next/dist/docs/` per
   [AGENTS.md](../AGENTS.md), rather than assuming an older/more commonly
   documented API. See
   [06-nextjs-version-gotchas.md](06-nextjs-version-gotchas.md) for what
   this actually caught.
2. **`npx tsc --noEmit`** after the edit. Cheap, catches type drift across
   files immediately (e.g. a prop added to `PhotoPurchasePanel` without
   updating its one caller).
3. **`npx eslint <changed files>`** — scoped to what changed, not the whole
   repo, to keep the loop fast.
4. **`next build`** specifically for anything touching routing, the Stripe
   webhook, or a `Suspense` boundary — `tsc` doesn't catch static-generation
   or Suspense-boundary issues on its own.
5. **For UI/UX changes: actually run the app and look at it.** This project
   has no committed screenshot-testing setup, so the practice has been:
   start the dev server, drive it with a throwaway Playwright script
   (`chromium.launch()`, navigate, interact, screenshot), and read the
   resulting image before calling a visual change done. Type-checking
   proves the code compiles; it doesn't prove a modal renders correctly at
   390px width. Screenshots at both a desktop and mobile viewport caught
   real layout issues (e.g. confirming the "added to cart" panel collapses
   to a bottom sheet on mobile) that would not have surfaced from
   `tsc`/`eslint` alone.

Steps 2–4 are fast enough to run after almost every edit rather than
batching them at the end — catching a type error immediately, while the
change is still fresh, is cheaper than discovering it three files later.

## Scoping: decide vs. ask

Small, reversible, in-the-weeds decisions get made directly and explained
afterward — copy wording, which existing CSS class to reuse vs. add a new
one, where exactly to insert a new section on a page. These don't need
sign-off because they're cheap to redo if wrong.

Decisions that change the *shape* of the work get raised as an explicit
choice before starting, especially when the cost of guessing wrong is
"redo a large chunk of work" rather than "tweak a sentence." A concrete
example: this documentation set itself. The original `case-study/README.md`
referenced seven companion files that didn't actually exist yet — whether
to (a) collapse it into one self-contained doc or (b) actually author all
seven as real documentation was asked directly rather than assumed, because
the two options differ by an order of magnitude in scope and there was no
strong signal in the request itself for which was intended.

## What the commit history does and doesn't tell you

`git log` on this repo is a rough timeline, not a curated changelog —
messages are short and informal (`push`, `styling`, `order`, `front page`)
rather than conventional-commit style, and don't reliably explain *why* a
change was made. Don't rely on commit messages for intent.

The "why" instead lives in code comments, which this codebase uses
consistently for exactly that purpose — not restating *what* a line does,
but the non-obvious reasoning behind it (see `lib/orders.ts`,
`lib/pricing.ts`, or `lib/supabase/proxy.ts` for dense examples). When
extending a file, match that convention: a comment earns its place by
explaining a constraint, invariant, or "why not the obvious alternative,"
not by describing what the following code already makes clear.
