# Nick Whittaker Imagery

Fine-art ocean and water photography — portfolio, print shop, and trade program for a New Zealand-based photographer.

## Description

Nick Whittaker Imagery is the e-commerce storefront and portfolio for a New Zealand ocean and water photographer. Visitors browse fine-art prints by category, order framed prints with size, paper and framing options, and check out via Stripe. A dedicated trade program serves interior designers, real estate stagers, hospitality and commercial buyers. Built on Next.js App Router with a filesystem-as-CMS content model, so new prints are added by dropping files into a folder, backed by Supabase for auth and orders.

## Features

- Gallery browsing by category, with tag filtering and a lightbox viewer
- Per-print purchase options — size, paper finish, framing style and colour
- Cart and checkout via Stripe Checkout, with a webhook as the source of truth for paid orders
- Trade & commercial pricing pages for interior design, real estate, hospitality and commercial buyers
- Magic-link auth and order history via Supabase
- Admin order management view
- Events/exhibitions listing and a photographer biography page
- Filesystem-as-CMS: photos and room mockups are read directly from `public/`, no database or headless CMS needed for content

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS v4 utilities, with a hand-authored design-token stylesheet for the visual system
- [Supabase](https://supabase.com) — Postgres, Row Level Security, magic-link auth
- [Stripe](https://stripe.com) Checkout + webhooks for payment
- Nodemailer for transactional email
- ESLint

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project and a Stripe account (for full commerce functionality)

### Installation

```bash
npm install
```

### Environment variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
GMAIL_SMTP_USER=
GMAIL_SMTP_APP_PASSWORD=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Project Structure

```
src/app/
├── [category]/[photo]/   # Dynamic print detail pages
├── admin/                # Order management
├── api/stripe-webhook/   # Stripe payment webhook
├── auth/, login/         # Supabase magic-link auth
├── cart/, checkout/      # Cart and Stripe checkout flow
├── components/           # Shared React components
├── lib/                  # Catalog, categories, framing, trade data
├── trade/                # Trade & commercial program pages
└── styles/               # Design-token stylesheet
public/                   # Source photos and room mockups (filesystem-as-CMS)
supabase/migrations/      # Database schema
```

## Checks

```bash
npm run lint
npm run build
```

## Deployment

Deployed on [Vercel](https://vercel.com).

## License

Private and proprietary — all rights reserved.
