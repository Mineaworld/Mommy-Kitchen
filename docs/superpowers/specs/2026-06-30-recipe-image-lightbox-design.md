# Recipe Image Lightbox — Design Spec

**Date:** 2026-06-30
**Branch:** `feature/recipe-image-viewer`
**Status:** Approved (brainstorming complete)

---

## 1. Goal

Let users **view a recipe's image fullscreen with a clear close affordance**, without breaking the existing "tap card → recipe" navigation. Mobile-first PWA; works on desktop too.

## 2. Scope

**In scope**
- A reusable `ImageLightbox` component (Radix Dialog).
- A small `ImageLightboxTrigger` overlay button (expand icon) added to each recipe card image.
- Lightbox wired into 4 surfaces: home, menu, category page, favorites.
- Single image per recipe (no data-model change). The existing `recipe.thumbnail_url` is reused.

**Out of scope**
- Multiple images per recipe (gallery) — deferred to a future spec.
- Pinch-zoom inside the lightbox — deferred; the centered `object-contain` render is enough for v1.
- Showing the image on the recipe detail page — explicitly excluded earlier in brainstorming.
- New dependencies.

## 3. User constraints (must-haves)

These are non-negotiable per the user:

1. **Mobile-first.** Layout, gestures, and tap targets are tuned for phones first. Desktop is a free bonus.
2. **Always-visible close affordance.** The image must never be presented without a clear way to dismiss it. The close (✕) button is always visible while the lightbox is open — not hidden behind a hover, not auto-dismissed after a timer, not buried behind a swipe gesture alone.

## 4. User experience workflow

```
User taps the expand icon (⛶) on a recipe image
  → Lightbox fades in over a dark backdrop
  → Recipe title shown top-left in Khmer, ✕ close button top-right (44×44)
  → Image rendered centered, object-contain, max ~90vh
  → Body scroll locked, focus moves to ✕

User taps ✕  ┐
User taps    │  → Lightbox fades out, focus returns to the trigger icon,
  backdrop   │     body scroll restored
ESC key      ┘
```

## 5. Architecture

### New files

| Path | Purpose |
|---|---|
| `components/image-lightbox.tsx` | The modal. Wraps `@radix-ui/react-dialog` (same primitive as `components/ui/sheet.tsx`). |
| `components/image-lightbox-trigger.tsx` | The reusable expand-icon button overlay placed on each card image. |
| `components/image-lightbox.test.tsx` | Vitest + Testing Library tests for the modal. |

### Edited files

| Path | Change |
|---|---|
| `app/menu/page.tsx` | `MenuCard` renders the trigger overlay; page owns `selectedImage` state + renders `<ImageLightbox>`. |
| `components/todays-picks.tsx` | Each pick card renders the trigger overlay; component owns state + lightbox. |
| `app/category/[slug]/page.tsx` | Wraps `RecipeCard` in a small client component that owns state (the page is a server component today). |
| `components/favorites-section.tsx` | Already a client component; adds state + lightbox. |
| `components/public-cards.tsx` | `RecipeCard` accepts an optional `onViewImage` prop; renders the trigger overlay when provided. Keeps the existing card-level `<Link>` for navigation. |

**Note on the home page (`app/page.tsx`):** it needs no direct edit — it is a server component that renders `TodaysPicks` and `FavoritesSection`, both of which already own the lightbox state internally. `MealPicker` is intentionally out of scope for v1: it shows recipe images transiently inside a slot-machine spin, not as browsable cards; integrating the lightbox there would be a different UX change and is deferred.

### Why per-page state, not a global store

Each trigger lives on a single page; the lightbox closes back onto the same page. A context/provider would add complexity for no real win. We may revisit if the lightbox needs to survive route changes.

## 6. Component contracts

### `ImageLightbox`

```ts
type ImageRef = {
  url: string;
  alt: string;        // recipe title in Khmer — used for alt + aria-label
  title?: string;     // optional caption shown top-left
};

type ImageLightboxProps = {
  image: ImageRef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
```

- When `image` is `null`, the dialog is unmounted (no leftover focus trap / scroll lock).
- Built on `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close` from `@radix-ui/react-dialog`.
- Overlay: `bg-black/90` (per mobile-first constraint: must be dark enough that image + chrome both stand out).
- Content: centered, max-w-[800px], max-h-[90vh]. Image rendered with `next/image` + `object-contain` + `sizes="100vw"`.
- Title rendered top-left in `text-base font-bold text-white` (Khmer, truncates).
- Close button: top-right, 44×44 tap target, white ✕ icon on a translucent dark circle (so it's visible against any image). Always visible — never auto-hide.
- Animations: fade + zoom via Tailwind `data-[state=open]:animate-in` etc. — gated by `motion-safe:` so reduced-motion users see an instant transition.
- `prefers-reduced-motion`: no animation, instant open/close.

### `ImageLightboxTrigger`

```ts
type ImageLightboxTriggerProps = {
  onActivate: () => void;
  label?: string; // defaults to Khmer "មើលរូបភាពពេញអេក្រង់"
};
```

- Renders a `<button type="button">` positioned absolute, top-right of its parent image container.
- Icon: a new `ExpandIcon` component added to `components/icons.tsx` (matching the existing pattern of inline SVG icon components — `BackIcon`, `PlayIcon`, `HeartIcon`, etc.). White stroke on a translucent dark circle so it stays visible against any recipe image.
- 44×44 tap target. `aria-label` from props (default Khmer string).
- `event.preventDefault()` + `event.stopPropagation()` so tapping it does NOT navigate via the surrounding `<Link>`.
- Decorative for screen readers when no `label` is provided; preferred to always pass the Khmer label.

## 7. Data flow (per surface)

Example for menu page:

```tsx
// app/menu/page.tsx (client component, already is)
const [selectedImage, setSelectedImage] = useState<ImageRef | null>(null);

// inside MenuCard render
<ImageLightboxTrigger
  onActivate={() =>
    setSelectedImage({
      url: recipe.thumbnail_url,
      alt: recipe.title_km,
      title: recipe.title_km,
    })
  }
/>

// at the bottom of MenuPage
<ImageLightbox
  image={selectedImage}
  open={selectedImage !== null}
  onOpenChange={(open) => !open && setSelectedImage(null)}
/>
```

The other 3 surfaces follow the same pattern. The category page needs an extra client wrapper because it's a server component today.

## 8. Edge cases & error handling

- **Empty `thumbnail_url`** → trigger overlay not rendered on that card.
- **Broken image URL** → `next/image` fallback; lightbox still closes via ✕ / ESC / backdrop.
- **Slow connection** → lightbox shows a centered `Skeleton` while the high-res image decodes.
- **Multiple opens across pages** (route change while open) → state is page-local; closing the dialog and navigating clears everything cleanly.
- **Reduced motion** → animations disabled.

## 9. Accessibility

- Lightbox: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` points to the title.
- Trigger: `aria-label` in Khmer (default).
- Keyboard: Tab focuses ✕; Shift+Tab wraps; ESC closes.
- Focus management: Radix moves focus to the close button on open and restores it to the trigger on close.
- Tap targets: all interactive elements ≥ 44×44 px (mobile-first constraint).
- Color contrast: ✕ button is white on `bg-black/40` circle — passes WCAG AA against any image.

## 10. Testing strategy

`components/image-lightbox.test.tsx` covers:
1. Renders nothing when `image={null}`.
2. Renders image + title + close button when open.
3. ESC key calls `onOpenChange(false)`.
4. Close button calls `onOpenChange(false)`.
5. Backdrop click calls `onOpenChange(false)`.
6. Image has `alt` matching recipe title.
7. Trigger button has correct `aria-label`.

Each of the 4 surfaces gets a small smoke test: tapping the trigger calls the setter / opens the lightbox.

Manual QA on a real phone before merge:
- Tap trigger on home / menu / category / favorites → lightbox opens.
- Image is clear, title + ✕ are visible.
- ✕, backdrop, ESC all close.
- No scroll-lock leakage after close.
- No layout shift in the underlying page.

## 11. Success criteria

1. `npm run build` succeeds with no new TypeScript errors.
2. `npm run lint` passes.
3. New unit tests pass: `npx vitest run components/image-lightbox.test.tsx`.
4. On a real phone, tapping the expand icon on any recipe card opens the lightbox within ~100ms; closing it (any of ✕, backdrop, ESC) restores the previous view with no scroll leak.
5. The close button is always visible while the lightbox is open (per user constraint).
6. No new runtime dependency added to `package.json`.

## 12. Open questions

None. All clarifying questions resolved during brainstorming.

## 13. Deferred follow-ups (not in this spec)

- Multi-image gallery per recipe (new `recipe_images` table, admin upload UI, gallery UI).
- Pinch-zoom inside the lightbox.
- Image shown on the recipe detail page (currently video-only).
