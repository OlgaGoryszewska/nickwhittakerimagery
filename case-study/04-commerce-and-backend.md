# Commerce & Backend

A small commerce backend — Supabase for storage/auth, Stripe Checkout for
payment, Nodemailer for email — sized for a solo photographer's order
volume, not a "real" e-commerce platform. No cart/order microservice, no
custom payment UI, no CMS for orders beyond the Supabase dashboard.

## Guiding rule: never trust the client for money

The cart (`CartContext`, `localStorage`-backed — see
[05-component-patterns.md](05-component-patterns.md)) is just a UI
convenience. Every price a customer sees client-side is **recomputed
server-side from the catalog** before anything is charged or recorded:

- [`lib/pricing.ts`](../src/app/lib/pricing.ts)'s `lineTotal()` and
  `calculateOrderTotals()` look up the current price for a `size` and
  `framing` from `SIZE_OPTIONS`/`PURCHASABLE_FRAMING_STYLES` — they never
  read `CartItem.priceValue`, even though that field exists on the cart item
  for display purposes. A tampered `localStorage` cart cannot change what
  gets charged.
- [`lib/orders.ts`](../src/app/lib/orders.ts)'s `createOrder()` does the
  same when writing `order_items.unit_price`/`line_total` — recomputed via
  `lineTotal(item)`, not read from the client-sent item.
- The Stripe Checkout Session's line items (`checkout/actions.ts`) are built
  from the same server-side `lineTotal()` call.

If you ever need to add a new size, framing style, or price, changing
`catalog.ts`/`framing.ts` is the single source of truth — nothing else
needs to change for pricing to stay consistent everywhere it's used.

## Checkout flow

```
Cart (client)
  → startCheckout() Server Action (checkout/actions.ts)
      1. calculateOrderTotals() — authoritative totals
      2. createOrder() — writes a `pending` order + order_items row (Supabase)
      3. stripe.checkout.sessions.create() — hosted Checkout Session,
         metadata.orderId = the order just created
  → redirect to Stripe's hosted payment page
  → customer pays
  → Stripe sends `checkout.session.completed` to /api/stripe-webhook
      → markOrderPaid(orderId, paymentIntentId)   [status: pending → paid]
      → sendOrderConfirmationEmail()               [best-effort, Nodemailer]
  → customer is redirected to /checkout/success (UX only)
```

The order row is created **before** the Stripe session, specifically so
there's a stable `orderId` to pass as `metadata.orderId` — the webhook has
no other reliable way to know which order a given Stripe session
corresponds to.

**The webhook is the only thing that marks an order paid.** The
`/checkout/success` page the customer lands on after paying is a pure UX
confirmation — it clears the local cart, but it never writes `status:
"paid"`. This matters because the success-page redirect is a client-side
navigation Stripe controls; it can be skipped (closed tab, browser crash,
customer never makes it back) even after a successful payment. The webhook,
subscribed to `checkout.session.completed` in the Stripe Dashboard, fires
server-to-server regardless of what the customer's browser does next — see
the comment at the top of
[`api/stripe-webhook/route.ts`](../src/app/api/stripe-webhook/route.ts).

Webhook signature verification (`stripe.webhooks.constructEvent`) happens
before any of that logic runs, using `STRIPE_WEBHOOK_SECRET` — the raw
request body is read via `request.text()` rather than `request.json()`
because Stripe's signature is computed over the exact raw bytes.

## Supabase: auth + RLS

Auth is **email/password**, not magic-link — `signInWithPassword` /
`signUp` in [`login/page.tsx`](../src/app/login/page.tsx), using the
Supabase browser client. Two flows worth understanding if you're extending
this:

- **Sign-up confirmation** and **password reset** both go through
  Supabase's hosted email templates, which redirect back to this domain —
  confirmation lands on [`auth/confirm/route.ts`](../src/app/auth/confirm/route.ts),
  which exchanges the email's `token_hash` for a real session via
  `verifyOtp()`. The `next` redirect target is validated as a same-site
  relative path only (`next.startsWith("/") && !next.startsWith("//")`) —
  an unvalidated `next` param would let a crafted-but-validly-signed
  confirmation link redirect off-domain.
- **Password reset** is the one flow that *doesn't* go through
  `/auth/confirm`: Supabase's default reset-password email template
  redirects with the session in the URL **fragment**
  (`#access_token=...`), which a server route never sees — only the
  browser does. `resetPasswordForEmail()` points straight at
  `/reset-password`, a client page that relies on the Supabase browser
  client auto-detecting the fragment from `window.location` on load. See
  the comment in `login/page.tsx` above the `resetPasswordForEmail` call if
  you need to touch this.

Three Supabase clients, each with a distinct trust level (all in
`lib/supabase/`):

| Client | File | Used from | Privilege |
| --- | --- | --- | --- |
| Browser | `client.ts` | Client Components | Normal (RLS-scoped to the signed-in user) |
| Server | `server.ts` | Server Components, Route Handlers, Server Actions | Normal (RLS-scoped), cookie-aware |
| Admin | `supabase/admin.ts` | **Only** `lib/orders.ts` | Service-role key — **bypasses RLS entirely** |

The admin client's own file comment is explicit about why it's this
restricted: it can read/write every row in every table regardless of RLS
policy, so it's imported only where orders are actually written
server-side, never from a `"use client"` module or an unvalidated request
path.

**Session refresh** happens in [`src/proxy.ts`](../src/proxy.ts) (see
[06-nextjs-version-gotchas.md](06-nextjs-version-gotchas.md) for why this
file isn't called `middleware.ts`), which calls
`supabase.auth.getUser()` on every matched request — Server Components
can't write cookies, so without this, sessions would silently go stale
instead of refreshing. It fails open (passes the request through unchanged)
if Supabase env vars are missing, so a misconfigured project doesn't 500
the entire site.

### Row Level Security

Defined in [`supabase/migrations/0001_orders.sql`](../supabase/migrations/0001_orders.sql):

- `profiles`, `orders`, and `order_items` all have RLS enabled with **only
  `select` policies** for the `authenticated` role, scoped to
  `auth.uid() = user_id` (directly on `orders`; via an `exists (select 1
  from orders where ...)` subquery on `order_items`, since that table has
  no `user_id` column of its own).
- There is **no insert/update/delete policy** for `anon` or `authenticated`
  on any of these tables. The only way to write an order is the
  service-role admin client from server code — a customer's browser
  session, even if compromised, cannot write or alter an order through the
  Supabase API directly.
- `profiles` rows are created automatically by a `security definer` trigger
  (`handle_new_user()`) on `auth.users` insert — the app never has to
  special-case "signed up but no profile row yet."

### Admin gate

Single-admin, not role-based: [`lib/admin.ts`](../src/app/lib/admin.ts)
checks whether the signed-in user's email matches the `ADMIN_EMAIL` env var.
No roles table, because there's only ever one admin. Two entry points, both
re-checking independently:

- `requireAdmin()` — used by the `/admin` Server Component page, redirects
  signed-out visitors to `/login` and anyone-but-the-admin to `/`.
- `getAdminUser()` — used by `admin/actions.ts` Server Actions. Actions are
  callable directly (each compiles to its own endpoint), so the page-level
  guard doesn't gate them — every admin Server Action re-checks
  `getAdminUser()` itself rather than trusting that only the guarded page
  could have called it.

## Email

[`lib/email.ts`](../src/app/lib/email.ts) sends order confirmations via
Nodemailer over Gmail SMTP (an App Password on a Google Workspace mailbox,
not OAuth — see `GMAIL_SMTP_USER`/`GMAIL_SMTP_APP_PASSWORD`). It's called
only from the webhook, after `markOrderPaid()` succeeds, and is explicitly
**best-effort**: a failed send is logged and swallowed, never surfaced as a
failed webhook response — a broken SMTP config should never make Stripe
think the webhook itself failed (which would trigger retries) or block an
order from being marked paid.

## Environment variables

See the root [README.md](../README.md#environment-variables) for the full
list. The distinction worth remembering: `NEXT_PUBLIC_*` keys are safe to
expose (anon key, publishable key), everything else is server-only and
would be a real credential leak if it ever ended up in client-bundled code.
