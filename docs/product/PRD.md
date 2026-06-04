# PRD: Khmer Recipe App for Mom (Mobile-First PWA)

## 1. Problem Statement

The user needs a recipe web app for their mom who has low literacy and relies on visual and spoken guidance. Existing recipe experiences assume text-heavy navigation and are difficult for her to use confidently.

## 2. Product Goal

Build a mobile-first PWA that enables a tap-and-watch cooking workflow with Khmer-focused recipe content.

## 3. Target Users

- Primary user: Mom (Khmer-speaking only, low reading reliance, smartphone user, prefers memory, audio, and visual guidance)
- Secondary user: Admin (son, manages content and app quality)
- Future secondary users: family admins who may help manage recipes later

## 4. Device and Platform

- Primary optimization target: OPPO A20 (Android Chrome)
- Supported secondary target: iPhone Safari
- Distribution: Web app installable to home screen (PWA)

## 5. MVP Scope

- 30 to 50 trusted Khmer and familiar Asian recipes for first family testing, scaling toward 150 later
- Big image category navigation
- Home-page visual menu of published dishes
- Lunch/dinner/anything random meal picker
- Recipe detail with embedded YouTube playback
- Fallback button to open video in YouTube app/site
- Generated Khmer voice prompts for navigation and selected recipes
- Single-admin recipe management via private admin pages
- Online-first behavior with cached recent pages
- Basic privacy-safe analytics

## 6. Out of Scope (MVP)

- Multi-admin roles and permission matrix
- Full offline video playback
- Ingredient/fridge inventory
- Text-heavy search as the primary discovery path
- Complex social features, comments, ratings
- Payments or ads

## 7. User Needs

### Mom

- Easy navigation with large images and clear tap targets
- Minimal reading requirement; interface should work mostly through memory, photos, and audio
- Dish recognition through photos first, text second
- Quick access to trusted Khmer tutorials
- Random lunch/dinner suggestions when she does not know what to cook
- Reliable fallback when embedded playback fails

### Admin

- Fast recipe add/edit/remove workflow
- Secure private access
- Simple way to control publish/unpublish status
- Future path for other family members to help manage recipes

## 8. Functional Requirements

1. Home page shows large recipe categories with images.
2. Home page shows a visual menu of published recipe cards.
3. Category page lists recipe cards with thumbnail and short Khmer title.
4. Recipe detail shows embedded YouTube player first.
5. If embedding fails, show fallback action to open YouTube directly.
6. Admin can create, update, delete, and publish recipes.
7. Public users can only view published recipes.
8. Key actions trigger generated Khmer voice prompts.
9. App includes a simplified lunch/dinner/anything random picker.
10. App is installable as PWA.

## 9. Non-Functional Requirements

- Performance:
  - Fast first render on low-end Android profile
  - Lazy load non-critical assets
- Accessibility:
  - Touch target size at least 48px
  - Semantic HTML and proper labels
  - WCAG 2.1 AA baseline
- Security:
  - Authenticated admin-only write operations
  - Input validation at API boundary
  - RLS policies on data tables
- Reliability:
  - Graceful handling of network errors
  - Cached shell and recently viewed pages

## 10. Success Metrics

- Mom can reach and play a recipe in three taps or fewer from home
- Mom can browse dish photos directly from home without choosing a category first
- Mom can get a lunch or dinner suggestion with one primary action
- At least 95% of tested videos are playable through embed or fallback
- Admin can publish a new recipe in under two minutes
- No unauthorized public write access

## 11. Acceptance Criteria

1. Public flow: `Home -> Category -> Recipe -> Play` works on OPPO A20 and iPhone.
2. Public flow: `Home -> Recipe -> Play` works from the visual menu.
3. Lunch/dinner random picker selects and opens a recipe without ingredient/fridge data.
4. Embed fallback action appears and works when embed is blocked.
5. Admin route is protected and requires login.
6. Unpublished recipes are hidden from public routes.
7. PWA install prompt is available on supported browsers.
8. Generated Khmer voice cue works for key actions.
