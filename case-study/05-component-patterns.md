# Component Patterns

Small, self-contained React patterns from this codebase that are worth
reusing wholesale on another project, independent of anything
photography-specific.

## `localStorage`-synced state via `useSyncExternalStore`

Both the cart ([`CartContext.tsx`](../src/app/components/CartContext.tsx))
and the browsing-history store
([`RecentlyViewed.ts`](../src/app/components/RecentlyViewed.ts)) use the
same shape:

- A **module-level variable** holds the current state (not `useState`) —
  so it's shared across every component that reads it, without prop
  drilling or needing every consumer to be inside the same Provider
  instance.
- A `Set<() => void>` of listeners, notified via a `notify()` call after
  every mutation.
- `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` is what
  components actually call to read the state reactively.

The reason this exists instead of a `useState` + `useEffect(() =>
localStorage.setItem(...))` pair: that pattern reads `localStorage`
synchronously during the effect, which either mismatches the server's
render (server always renders "empty") or requires a loading flicker.
`useSyncExternalStore`'s `getServerSnapshot` explicitly returns an empty
value for SSR, and hydration on the client swaps in the real
`localStorage`-backed value in the same commit — no flicker, no hydration
warning.

```ts
let items: T[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (!hydrated) {
    hydrated = true;
    try { items = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch {}
  }
  return items;
}
function getServerSnapshot() { return EMPTY; }

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

Mutations (`addItem`, `recordPhotoView`, etc.) are plain exported functions,
not hooks — they can be called from event handlers anywhere, including
outside React (they just reassign the module variable, persist to
`localStorage`, and call `notify()`). `CartContext` additionally wraps this
in a `Provider`/`useContext` pair to expose derived values (`totalCount`,
`totalPrice`) computed once via `useMemo`; `RecentlyViewed` skips the
Provider entirely since it has no per-tree derived state, just the raw list
— a hook can read a module-level store directly without a Context if
there's nothing to inject per-subtree.

## Scroll-reveal wrapper (`Reveal.tsx`)

A single component wraps any element and fades/slides it in in when it
enters the viewport, via `IntersectionObserver`:

```tsx
<Reveal className="section-head" delay={120}>
  <h2>Heading</h2>
</Reveal>
```

- Threshold `0.15`, `rootMargin: "0px 0px -60px 0px"` — triggers slightly
  before the element is fully in view, not right at the viewport edge.
- Observer **disconnects after first trigger** (`observer.disconnect()`
  inside the callback) — this is a one-shot reveal, not a re-trigger on
  every scroll past the element, which keeps repeated scrolling cheap.
- `delay` is applied via inline `transitionDelay`, letting callers stagger
  a list (`delay={index * 60}` in `PrintGrid`) without separate CSS rules
  per item.
- Respects `prefers-reduced-motion` — handled once in `style-guide.css`
  (`.reveal` becomes fully opaque/untransformed under the media query),
  not per-component, so every use of `Reveal` gets the accessibility
  behavior for free.

## Portal-based Lightbox / modal pattern

Both [`Lightbox.tsx`](../src/app/components/Lightbox.tsx) (full-screen
image viewer) and
[`AddedToCartPanel.tsx`](../src/app/components/AddedToCartPanel.tsx)
(post-add-to-cart panel) share a pattern for anything that needs to render
above the entire page regardless of where it's mounted in the tree:

- `createPortal(<div className="lightbox" .../>, document.body)` — escapes
  whatever `overflow`/`z-index`/`transform` context the triggering
  component happens to be nested in.
- `document.body.style.overflow = "hidden"` while open, restored to its
  previous value on cleanup — locks background scroll without a CSS class
  toggle that could fight with other scroll-lock logic.
- **Outside-click-to-dismiss**: `onClick={onClose}` on the outer backdrop
  `<div>`, `onClick={(e) => e.stopPropagation()}` on the inner content — a
  click anywhere outside the actual card/image closes it, a click inside
  doesn't bubble up to the backdrop's handler.
- `Escape` key closes, wired via a `keydown` listener added in `useEffect`
  and removed on cleanup — not a global listener that outlives the
  component.
- `role="dialog"` `aria-modal="true"` `aria-label="..."` on the outer
  container.

`Lightbox` additionally handles swipe navigation via `onPointerDown`/
`onPointerUp` — captures the pointer, compares start/end X position on
release, and only treats it as a swipe if horizontal movement exceeds both
50px and the vertical movement (so a vertical scroll gesture on mobile
isn't misread as a swipe).

## Derive UI state from real data, not a timer

An early version of the "added to cart" checkmark on `PrintGrid`'s
quick-add button used a `window.setTimeout` to flip an icon back after
1.2s, regardless of whether the item was still in the cart. It was replaced
with deriving the indicator directly from cart state:

```tsx
const inCart = items.some((i) => i.id === defaultCartId(photo));
// ...
className={`print-card__cart-btn${inCart ? " is-in-cart" : ""}`}
```

The general lesson: if a "did this action succeed" indicator can instead be
computed from the actual state the action mutated, prefer that — it stays
correct if the state changes some other way (item removed from cart
elsewhere), survives a page reload without extra work (the cart is
`localStorage`-backed, so `inCart` is correct on the very first render),
and there's no timer to tune or accidentally leave stale.

## Cross-referencing two independent stores

`AddedToCartPanel` is the clearest example of composing the two stores
above without coupling them: it reads `useRecentlyViewed()` for
"what has this visitor actually browsed" and `useCart().items` for
"what's already in their cart," and merges them purely at render time (a
recommended photo already in the cart renders its quick-add button as a
persistent checkmark, same `is-in-cart` pattern as above). Neither store
knows the other exists — the composition happens in the one component that
needs both, not by teaching either store about the other's shape.
