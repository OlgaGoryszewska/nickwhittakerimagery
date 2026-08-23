# Next.js Version Gotchas

This project runs **Next.js 16.2.10** with **React 19.2.4**. Both are recent
enough that a lot of pre-existing documentation, tutorials, and
model-training-data assumptions describe an older API. This doc lists the
specific places that mismatch actually surfaced in this codebase, verified
against the version actually installed
(`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`, and
the AGENTS.md pointer to read that folder before writing Next.js code).

## `middleware.ts` is now `proxy.ts`

Starting in Next.js 16, the `middleware` convention was renamed to `proxy`
to better describe what it actually does — the functionality is unchanged.
This project's request-interception file is
[`src/proxy.ts`](../src/proxy.ts), not `middleware.ts`:

```ts
// src/proxy.ts
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}
export const config = { matcher: [...] };
```

If you're used to `middleware.ts` / `export function middleware(...)`,
searching for that filename in this repo will come up empty — the same
mechanism exists, under the new name. Config flags follow the same rename
(e.g. `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`), though this
project doesn't use any of those.

## `params` (and `searchParams`) are `Promise`s

Every dynamic route page in this project awaits its params:

```tsx
// src/app/[category]/[photo]/page.tsx
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ category: string; photo: string }>;
}) {
  const { category: categorySlug, photo: photoSlug } = await params;
  // ...
}
```

This became a breaking change in Next.js 15 (with a temporary synchronous
compatibility shim) and that shim was **fully removed in Next.js 16** —
synchronous `params`/`searchParams` access no longer works at all, not just
generates a warning. The same applies to `cookies()` and `headers()` (see
`lib/supabase/server.ts`, which `await cookies()`). Code examples from
before Next.js 15 that destructure `params` directly without `await` will
not type-check against this version.

## Turbopack is the default — no flag needed

`package.json`'s scripts are plain `next dev` / `next build`, no
`--turbopack` flag:

```json
"dev": "next dev",
"build": "next build",
```

Older docs/examples that show `next dev --turbopack` as the "opt into the
new bundler" step are describing Next.js 15 and earlier. In 16, Turbopack
is stable and on by default for both dev and build; the flag exists now
only to be explicit, and `--webpack` is the opt-*out* flag if you need the
old bundler for a specific reason (e.g. a webpack-specific plugin with no
Turbopack equivalent).

## `next lint` is gone

There's no `next lint` in this project — `package.json`'s `lint` script is
plain `eslint`, and `eslint.config.mjs` is a flat config file. Next.js 16
removed the `next lint` command entirely (`next build` also no longer runs
linting as a side effect), and `@next/eslint-plugin-next` now defaults to
ESLint's flat-config format. Any instruction to run `next lint` against
this codebase will fail — use `npm run lint` (which is just `eslint`).

## The habit that catches these early

[AGENTS.md](../AGENTS.md) at the project root sets the expectation: read the
relevant page under `node_modules/next/dist/docs/` before writing code that
touches a Next.js convention you're not 100% certain about for *this*
installed version, and treat deprecation notices in that folder as
authoritative over prior training data or memory of older Next.js versions.
In practice, that meant checking the docs folder before touching routing,
`params`, or anything proxy/middleware-shaped, rather than after hitting a
type error.

The second habit that catches version drift, even when the docs check is
skipped or the issue is subtler than a renamed file: run `npx tsc --noEmit`
after any non-trivial change, and a full `next build` for anything touching
routing, webhooks, or a `Suspense` boundary (`next build` catches static-
generation and Suspense-boundary issues that `tsc` alone won't, e.g. a
`useSearchParams()` call needing a `Suspense` wrapper — see
`login/page.tsx`, where `LoginForm` is wrapped for exactly this reason).
Both are cheap enough to run after nearly every change, and this version of
Next.js is new enough that "it type-checks" and "it builds" are both worth
confirming separately, not assumed from the other.
