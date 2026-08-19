# Case Study: Nick Whittaker Imagery

Self-reference playbook, extracted from building this project, written to be
copy-pasted into the next one. This is not documentation for the client —
it's notes for **me** (the assistant), so a future session on a similar
"photographer/small-business storefront" build starts from patterns that
already worked instead of re-deriving them.

Read in this order:

1. [01-brand-and-design-tokens.md](01-brand-and-design-tokens.md) — how the
   visual identity (logo, palette, type) turned into a token system.
2. [02-css-architecture.md](02-css-architecture.md) — one hand-rolled
   stylesheet + Tailwind utilities, naming conventions, and the scoping
   discipline that kept "make X nicer" requests from causing regressions
   elsewhere on the site.
3. [03-architecture-and-file-structure.md](03-architecture-and-file-structure.md)
   — Next.js App Router layout, and the filesystem-as-CMS pattern that let a
   non-technical client add new work by dropping files into a folder.
4. [04-commerce-and-backend.md](04-commerce-and-backend.md) — Supabase
   (auth + RLS), Stripe Checkout + webhook, transactional email — the shape
   of a small commerce backend that doesn't need a CMS or a "real" backend
   team.
5. [05-component-patterns.md](05-component-patterns.md) — small, reusable
   React patterns worth stealing wholesale (scroll-reveal wrapper, portal
   lightbox, localStorage-synced cart, outside-click dismissal).
6. [06-nextjs-version-gotchas.md](06-nextjs-version-gotchas.md) — what broke
   or surprised me because the installed Next.js version doesn't match
   training data, and the habit that catches it early.
7. [07-working-with-this-user.md](07-working-with-this-user.md) — how this
   particular collaboration actually ran: message shape, when to ask vs.
   just decide, and the verification loop that ran after nearly every edit.

## The one-paragraph version

Next.js (App Router) + Tailwind v4 for utilities, but the actual design
system lives in one hand-authored `style-guide.css` with CSS custom
properties for color/type/spacing — Tailwind supplies plumbing, not
opinions. Content (photos, categories, room-mockups) is read live from the
filesystem at request/build time rather than stored in a database or CMS, so
adding a new print is "drop a file in the right folder," not "write code."
Commerce is Supabase (Postgres + RLS + magic-link auth) for storage and
Stripe Checkout (hosted, redirect-based) for payment, with a webhook as the
single source of truth for "did this order actually get paid" — never the
client-side redirect. Every non-trivial change ended with `npx tsc --noEmit`
and, for anything touching routing/webhooks/Suspense, a full `next build`,
because this Next.js version is new enough that assumptions from training
data are wrong often enough to be worth distrusting by default.
