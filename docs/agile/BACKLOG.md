# Product Backlog

Legend:
- Priority: `Must`, `Should`, `Could`, `Won't`
- Points: `1, 2, 3, 5, 8`

## Epic EPIC-01: Product Foundation

### EPIC-01-STORY-01
- Story: As the developer, I want a Next.js TypeScript app baseline so that I can build quickly with strong typing.
- Priority: Must
- Points: 3
- Dependencies: None
- Acceptance:
  - App boots locally
  - TypeScript strict mode enabled
  - Base folder structure defined

### EPIC-01-STORY-02
- Story: As the developer, I want documentation-first project structure so that implementation has clear contracts.
- Priority: Must
- Points: 2
- Dependencies: None
- Acceptance:
  - `docs/` includes PRD, ERD, DFD, architecture, API, agile docs

## Epic EPIC-02: Data and Security

### EPIC-02-STORY-01
- Story: As admin, I want Supabase schema for categories and recipes so that content is structured and queryable.
- Priority: Must
- Points: 5
- Dependencies: EPIC-01-STORY-01
- Acceptance:
  - Tables created with keys and indexes
  - Migrations tracked

### EPIC-02-STORY-02
- Story: As admin, I want protected write access so that only I can modify recipes.
- Priority: Must
- Points: 5
- Dependencies: EPIC-02-STORY-01
- Acceptance:
  - Admin auth flow works
  - Public write access is blocked
  - RLS policies enforced

## Epic EPIC-03: Mom-Facing Browsing UX

### EPIC-03-STORY-01
- Story: As mom, I want large image category cards so that I can browse without reading much text.
- Priority: Must
- Points: 3
- Dependencies: EPIC-02-STORY-01
- Acceptance:
  - Home page shows active categories with big cards
  - Touch targets meet minimum size

### EPIC-03-STORY-02
- Story: As mom, I want category pages with visual recipe cards so that I can pick dishes quickly.
- Priority: Must
- Points: 3
- Dependencies: EPIC-03-STORY-01
- Acceptance:
  - Category list loads published recipes
  - Recipe cards show thumbnail and short Khmer title

## Epic EPIC-04: Playback Experience

### EPIC-04-STORY-01
- Story: As mom, I want recipe videos to play in-app so that cooking guidance is immediate.
- Priority: Must
- Points: 5
- Dependencies: EPIC-03-STORY-02
- Acceptance:
  - Embedded player appears on recipe detail
  - Play action is obvious

### EPIC-04-STORY-02
- Story: As mom, I want a fallback open action so that blocked embeds still work.
- Priority: Must
- Points: 2
- Dependencies: EPIC-04-STORY-01
- Acceptance:
  - Fallback button appears on embed failure
  - Opens YouTube app/site successfully

## Epic EPIC-05: Khmer Voice Guidance

### EPIC-05-STORY-01
- Story: As mom, I want generated Khmer voice prompts so that I can navigate confidently without needing family-recorded audio for every recipe.
- Priority: Must
- Points: 5
- Dependencies: EPIC-03-STORY-01
- Acceptance:
  - Generated Khmer voice prompts trigger for key actions
  - Common prompts can be cached or reused
  - App remains usable when browser audio is unavailable

## Epic EPIC-06: Admin Content Management

### EPIC-06-STORY-01
- Story: As admin, I want to create and edit recipes so that catalog updates are easy.
- Priority: Must
- Points: 5
- Dependencies: EPIC-02-STORY-02
- Acceptance:
  - CRUD forms for recipes
  - Validation errors shown per field

### EPIC-06-STORY-02
- Story: As admin, I want publish/unpublish controls so that unfinished recipes stay private.
- Priority: Must
- Points: 2
- Dependencies: EPIC-06-STORY-01
- Acceptance:
  - Toggle state persisted
  - Public pages hide unpublished recipes

## Epic EPIC-07: PWA and Reliability

### EPIC-07-STORY-01
- Story: As mom, I want to install the app on home screen so that access is easy.
- Priority: Should
- Points: 3
- Dependencies: EPIC-03-STORY-01
- Acceptance:
  - Manifest and installability criteria met

### EPIC-07-STORY-02
- Story: As mom, I want recent pages to load under weak internet so that app remains useful.
- Priority: Should
- Points: 3
- Dependencies: EPIC-07-STORY-01
- Acceptance:
  - Cached shell and recently visited content available
  - Friendly offline message shown

## Epic EPIC-08: Observability and QA

### EPIC-08-STORY-01
- Story: As admin, I want basic analytics so that I can improve categories and recipe coverage.
- Priority: Should
- Points: 2
- Dependencies: EPIC-03-STORY-02
- Acceptance:
  - Core events tracked without personal data

### EPIC-08-STORY-02
- Story: As admin, I want cross-device validation so that OPPO A20 and iPhone both work.
- Priority: Must
- Points: 3
- Dependencies: EPIC-04-STORY-02, EPIC-07-STORY-01
- Acceptance:
  - Critical paths tested on Android and iPhone browsers
  - Issues logged and fixed for launch blockers

## Epic EPIC-09: Mom-First Menu Experience

### EPIC-09-STORY-01
- Story: As mom, I want a photo-first "Today Menu" on the home page so that I can recognize dishes without reading or first choosing a category.
- Priority: Must
- Points: 5
- Dependencies: EPIC-03-STORY-02
- Acceptance:
  - Home page shows published recipe cards before or near category filters
  - Recipe cards use large photos, large dish names, and a clear play/open action
  - Mom can open a recipe from the home page in two taps or fewer
  - Dish photos remain useful even when labels are ignored

### EPIC-09-STORY-02
- Story: As mom, I want public screens to use stable layouts, readable text, icons, and valid Khmer copy so that I can navigate by memory, photos, and audio.
- Priority: Must
- Points: 3
- Dependencies: EPIC-03-STORY-01
- Acceptance:
  - No corrupted Khmer text appears on public screens
  - Mom-facing English labels are replaced with simple Khmer, icons, or family-approved wording
  - Primary public actions are at least 56px tall
  - Core actions stay in consistent positions across public screens

### EPIC-09-STORY-03
- Story: As mom, I want a simplified lunch/dinner picker so that the app can choose food for me quickly.
- Priority: Must
- Points: 3
- Dependencies: EPIC-03-STORY-02
- Acceptance:
  - Picker exposes Lunch, Dinner, and Anything choices
  - Spinner result shows one large dish photo and one clear open/watch action
  - Ingredient or fridge filtering is not included

## Epic EPIC-10: Real Recipe Catalog

### EPIC-10-STORY-01
- Story: As admin, I want to manage categories from the app so that menu organization does not require database edits.
- Priority: Must
- Points: 5
- Dependencies: EPIC-06-STORY-01
- Acceptance:
  - Admin can create, edit, reorder, activate, and deactivate categories
  - Public screens only show active categories
  - Category validation prevents duplicate slugs

### EPIC-10-STORY-02
- Story: As mom, I want a starter catalog of trusted Khmer and familiar Asian recipes so that the app has enough real choices to replace asking the family.
- Priority: Must
- Points: 8
- Dependencies: EPIC-06-STORY-01, EPIC-10-STORY-01
- Acceptance:
  - At least 30 real published recipes exist before family testing
  - Each active category has at least two published recipes
  - Each recipe has a reliable thumbnail and YouTube link

## Epic EPIC-11: Voice and Familiarity

### EPIC-11-STORY-01
- Story: As mom, I want generated Khmer audio prompts across the main flow so that I can use the app even when reading is hard.
- Priority: Must
- Points: 5
- Dependencies: EPIC-05-STORY-01
- Acceptance:
  - Home, category, recipe detail, and meal picker screens expose useful audio prompts
  - Spinner announces the selected recipe
  - App remains usable if browser audio is unavailable
  - Adding a new recipe does not require family voice recording

### EPIC-11-STORY-02
- Story: As mom, I want favorite dishes near the top of the app so that I can quickly return to meals I already like.
- Priority: Should
- Points: 3
- Dependencies: EPIC-09-STORY-01
- Acceptance:
  - Recipe detail includes a large favorite/unfavorite action
  - Home page shows favorited recipes before the broader menu
  - Favorites work locally without login
