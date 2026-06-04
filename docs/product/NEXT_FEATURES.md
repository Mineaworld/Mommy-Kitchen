# Next Features: Mom-First Recipe App

This roadmap is based on the current app state and the real user: an older Cambodian mom who speaks Khmer, mostly uses her phone from memory instead of reading, and needs large, visual, low-effort choices.

## Confirmed User Decisions

- Mom speaks Khmer only for this app.
- The interface should not depend on reading, even Khmer reading.
- Photos are the main recognition method for dishes.
- Recipe images can come from the internet first, then be replaced with AI-generated or custom images later.
- Generated Khmer voice should be the default because recording family audio for every recipe would be too much work.
- One admin is enough for now, but future family admin support should remain possible.

## Product Direction

The app should feel less like a searchable recipe database and more like a visual restaurant menu for home cooking.

The fastest useful version should help her answer:

- What can I cook today?
- What looks good for lunch or dinner?
- Can I tap it and watch how to make it?

Ingredient/fridge features should stay out of scope for now. They add data-entry work and do not solve the main decision problem.

## Priority 1: Fix Mom-Facing Text and Accessibility

Current gap:

- Several visible Khmer strings are corrupted in the rendered source.
- Many mom-facing labels are still English.
- The app has large cards, but some controls still depend on reading small labels.
- Mom mostly navigates by memory, so repeated placement and recognizable icons matter as much as copy.

Build next:

- Replace corrupted Khmer strings with valid UTF-8 text.
- Use simple labels, food photos, and icons together.
- Keep important text at least `20px`; primary actions should be `56px` high or larger.
- Add a "large text" baseline rather than a separate setting for the MVP.
- Avoid small badges unless they are optional; duration is useful but secondary.
- Keep the same core actions in the same positions across screens so she can learn them by memory.

Acceptance:

- Mom can understand home, category, recipe, and spinner screens without reading long text.
- Every primary action is visible, high-contrast, and easy to tap.
- No visible mojibake or broken Khmer text remains in public screens.

## Priority 2: Restaurant-Menu Browsing

Current gap:

- Home page shows category cards, but it does not yet provide a broad menu-like view of dishes.
- Category-only browsing can hide the dish list behind one more decision.
- Dish photos are more important than dish names for recognition.

Build next:

- Add a "Today Menu" section on the home page with large dish cards from all published recipes.
- Keep categories, but make them secondary filters.
- Use a one-column mobile layout with photo-first cards.
- Show dish cards with:
  - large food photo
  - short dish name
  - lunch/dinner/any icon
  - one large "watch" or play affordance

Acceptance:

- From the home screen, she can browse actual dishes immediately.
- She can still tap a category when she wants a narrower menu.
- Recipe cards work as visual choices, not text-heavy search results.
- A dish can be recognized by image even if the text is ignored.

## Priority 3: Better Lunch/Dinner Random Picker

Current gap:

- A meal picker exists, but it still has English copy and more controls than she likely needs.

Build next:

- Simplify public picker to three choices:
  - Lunch
  - Dinner
  - Anything
- Remove breakfast unless your family actually needs it.
- After spinning, show one large result with:
  - photo
  - dish name
  - "watch" action
  - "spin again" action
- Do not add fridge or ingredient filters yet.

Acceptance:

- She can tap one button to get a lunch or dinner suggestion.
- The result is readable from arm's length.
- It takes one more tap to open the recipe video.

## Priority 4: Real Khmer/Cambodian Recipe Catalog

Current gap:

- The mock catalog has only sample recipes.
- The PRD says 150 recipes, but the next useful step is a smaller trusted catalog.

Build next:

- Start with 30 to 50 high-quality recipes before scaling to 150.
- Prioritize Cambodian/Khmer dishes first, then a few familiar adjacent dishes.
- Suggested starter categories:
  - Soup
  - Stir fry
  - Noodles
  - Rice dishes
  - Fish
  - Chicken
  - Pork
  - Dumplings
  - Vietnamese
  - Chinese
- Add category admin management so you are not editing categories through database scripts.

Acceptance:

- At least 30 real published recipes exist with reliable thumbnails and YouTube links.
- Every category shown to mom has at least a few recipes.
- Admin can add/edit recipes without touching code.

## Priority 5: Generated Khmer Voice Guidance

Current gap:

- The code has a Khmer TTS helper and a listen button on recipe detail, but voice guidance is not yet consistent across the app.
- Because she has limited reading comfort, voice should be treated as a primary interface, not a bonus.
- Recording family audio for every recipe is too expensive to maintain.

Build next:

- Add audio prompts for high-value actions:
  - home page greeting
  - category names
  - lunch/dinner spinner choices
  - selected recipe name
  - "open video"
- Use generated Khmer voice as the default for dynamic recipe names and prompts.
- Cache generated audio where possible so common prompts do not need to regenerate.
- Keep optional recorded family audio only for a few stable prompts if desired later.

Acceptance:

- Tapping the audio button on each public screen speaks the current screen or selected item.
- Spinner announces the selected dish.
- The app still works silently if browser audio is blocked.
- Adding new recipes does not require asking family members to record audio.

## Priority 6: Favorites and Usual Dishes

Current gap:

- The app treats all recipes equally.
- In real life, she likely repeats familiar meals.

Build next:

- Add a large "favorite" action on recipe detail.
- Add a "Usual dishes" or "Favorites" row near the top of home.
- Store favorites locally first; account sync can wait.

Acceptance:

- She can quickly return to dishes she likes.
- Favorites appear before the full catalog.
- The feature works without login.

## Priority 7: PWA Polish for Her Phone

Current gap:

- PWA pieces exist, but the real test is whether it behaves like a simple phone app on her device.

Build next:

- Test install flow on her actual Android phone.
- Confirm home-screen icon, app name, offline page, and recent-page caching.
- Make sure video fallback opens YouTube reliably.

Acceptance:

- The app launches from her home screen.
- Previously opened pages have a graceful weak-internet experience.
- YouTube fallback works when embedded playback fails.

## Recommended Build Order

1. Fix broken public text and replace English mom-facing labels.
2. Add home-page "Today Menu" dish browsing.
3. Simplify the lunch/dinner spinner.
4. Add real recipe/category admin support and seed 30 to 50 recipes.
5. Add generated Khmer voice prompts for navigation and spinner results.
6. Add local favorites/usual dishes.
7. Test install and playback on her actual phone.

## Features to Delay

- Ingredient/fridge inventory.
- Typed search as the main interface.
- Ratings, comments, sharing, accounts, and social features.
- Multi-admin permissions.
- Full offline video.

These can be useful later, but they do not solve the first problem: helping her decide what to cook and watch the recipe with minimal reading.
