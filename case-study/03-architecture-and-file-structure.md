# Architecture & File Structure

## Route layout

Standard Next.js App Router, under `src/app/`:

```
src/app/
├── page.tsx                    Home
├── [category]/page.tsx         Category listing (e.g. /waves)
├── [category]/[photo]/page.tsx Print detail page (e.g. /waves/velocity)
├── gallery/                    All-photos browser with tag filtering
├── trade/, trade/*/            Trade & commercial program + 4 segment pages
├── cart/, checkout/            Cart and Stripe checkout flow
├── admin/                      Single-admin order management
├── auth/, login/, reset-password/, account/   Supabase auth flow
├── api/stripe-webhook/         The one API route — payment confirmation
├── components/                 Shared React components (client + server)
├── lib/                        Data access, pricing, and domain logic
└── styles/style-guide.css      The design system (see 02-css-architecture.md)
```

`[category]` and `[category]/[photo]` are the only dynamic routes, and both
use `generateStaticParams` with `dynamicParams = false` — every category and
photo page is statically generated at build time from what's on disk (see
below), not rendered on demand. There's no CMS-driven "unknown slug" case to
handle.

## The filesystem is the CMS

This is the load-bearing decision in the whole project. There is no
database table, headless CMS, or admin UI for photos, categories, or tags.
The entire catalog is derived at request/build time by reading
[`public/`](../public) directly, in
[`src/app/lib/categories.ts`](../src/app/lib/categories.ts):

- **Categories** are a hardcoded array (`CATEGORY_DEFS`) mapping a URL slug
  to a folder name under `public/` (e.g. `waves` → `public/Waves/`).
- **Photos** are whatever image files exist in that folder — `getCategory()`
  calls `readdir()` on the folder, filters to `.jpg`/`.jpeg`/`.png`, and
  builds a `Photo` object per file (dimensions read via `image-size`,
  filename slugified into a URL slug).
- **Adding a new print is "drop a file into the right `public/` folder,"
  not "write code."** No migration, no CMS entry, no rebuild trigger beyond
  Next.js's normal static generation.

Per-photo metadata that can't be derived from the file itself — a real
title instead of "Waves Study 04", rich alt text, a non-default shoot
location, extra tags — lives in lookup tables in the same file, **keyed by
filename**: `TITLE_OVERRIDES`, `ALT_TEXT`, `LOCATION_OVERRIDES`,
`TAG_OVERRIDES`. A photo with no entry in these tables still works — it
falls back to a generated title (`"{Category} Study {NN}"`), a generated alt
text, and the default shoot location — so a freshly dropped-in file is never
broken, just less polished until someone fills in its metadata.

**Room mockups** ("see it on your wall") follow the same convention, one
level further: `getPhotoMockups()` reads `public/mockup/` and matches any
file whose name starts with `{photo's-base-filename}-`. Drop
`nick-whittaker-ocean-photography-cream-foam-texture-modern-bedroom.jpg`
into `public/mockup/` and it automatically appears in that photo's mockup
carousel — the room-descriptor suffix (`modern-bedroom`) becomes the
carousel caption, title-cased, with a small hand-maintained typo-correction
table (`LABEL_WORD_FIXES`) for filenames that were typed by hand.

### Why this matters

For a solo photographer with no engineering resources, this trades "learn a
CMS" for "know your file naming convention." It only works because the
metadata that *can't* be derived (titles, alt text, tags) is genuinely
optional — the site degrades gracefully to generated defaults rather than
breaking. If this pattern gets reused on a project where every photo
*needs* hand-written metadata before publishing, the filename-keyed
override tables stop being optional polish and become a required manual
step per file, which is a much worse trade-off — at that point, a real CMS
(even a lightweight one) is worth the added complexity.

## Server vs. client boundary

`categories.ts` touches `fs`/`path` and is server-only. The `Photo`/`Category`
**types** and pure constants (`TAGS`, `SIZE_OPTIONS`) it needs to share with
client components live in a separate file,
[`src/app/lib/catalog.ts`](../src/app/lib/catalog.ts), which deliberately
imports nothing from Node's filesystem APIs — see the comment at the top of
that file. This split exists so a client component (`GalleryBrowser`,
`PrintGrid`) can import `type Photo` and `TAGS` without accidentally
bundling `fs`/`readdir` into client JavaScript, which would either bloat the
bundle or fail to build entirely.

The general rule this project follows: server-only logic (filesystem reads,
service-role Supabase client, Stripe secret key) stays in files with no
`"use client"` anywhere in their import chain; anything a client component
needs (types, pure pricing math, brand constants) gets factored into its own
file with no server-only imports.
