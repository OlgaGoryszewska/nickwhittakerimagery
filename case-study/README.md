# Case Study: Nick Whittaker Imagery

Technical documentation of how this project is built: the design system,
file structure, commerce backend, and component patterns behind a fine-art
photography storefront built on Next.js. Written for anyone picking up this
codebase — or building a similar photographer/small-business storefront —
who needs the reasoning behind the decisions, not just the code.

Read in this order:

1. [01-brand-and-design-tokens.md](01-brand-and-design-tokens.md) — the
   visual identity (logo, palette, type) and how it became a token system.
2. [02-css-architecture.md](02-css-architecture.md) — one hand-rolled
   stylesheet plus Tailwind utilities, naming conventions, and the scoping
   discipline that keeps styling changes from causing regressions elsewhere
   on the site.
3. [03-architecture-and-file-structure.md](03-architecture-and-file-structure.md)
   — the Next.js App Router layout, and the filesystem-as-CMS pattern that
   lets a non-technical client add new work by dropping files into a folder.
4. [04-commerce-and-backend.md](04-commerce-and-backend.md) — Supabase
   (auth + RLS), Stripe Checkout + webhook, transactional email: the shape
   of a small commerce backend that doesn't need a CMS or a dedicated
   backend team.
5. [05-component-patterns.md](05-component-patterns.md) — small, reusable
   React patterns worth reusing elsewhere (scroll-reveal wrapper, portal
   lightbox, localStorage-synced cart and browsing history, outside-click
   dismissal).
6. [06-nextjs-version-gotchas.md](06-nextjs-version-gotchas.md) — where this
   Next.js version's behavior differs from older, more commonly documented
   versions, verified against the installed version's own docs.
7. [07-working-with-this-user.md](07-working-with-this-user.md) — the
   development workflow used throughout this project: decision-making
   conventions and the verification loop that ran after nearly every change.

## The one-paragraph version

Next.js (App Router) + Tailwind v4 for utilities, but the actual design
system lives in one hand-authored `style-guide.css` with CSS custom
properties for color/type/spacing — Tailwind supplies plumbing, not
opinions. Content (photos, categories, room mockups) is read live from the
filesystem at request/build time rather than stored in a database or CMS, so
adding a new print is "drop a file in the right folder," not "write code."
Commerce is Supabase (Postgres + RLS + email/password auth) for storage and
Stripe Checkout (hosted, redirect-based) for payment, with a webhook as the
single source of truth for "did this order actually get paid" — never the
client-side redirect. Every non-trivial change ended with `npx tsc --noEmit`
and, for anything touching routing, webhooks, or Suspense boundaries, a full
`next build`, because this Next.js version is new enough that assumptions
from older documentation or training data are wrong often enough to be worth
verifying by default.
