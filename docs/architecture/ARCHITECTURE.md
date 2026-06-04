# Architecture: Khmer Recipe PWA

## 1. System Overview

- Frontend: Next.js App Router + TypeScript
- Backend/Data: Supabase (Postgres, Auth, Storage optional)
- Video source: YouTube (embed + open externally fallback)
- Hosting: Vercel (app) + Supabase (data/auth)

## 2. Runtime Components

1. Public Web App
- Home/category/recipe pages
- PWA shell and cache
- Khmer voice layer (TTS + recorded fallback)

2. Admin App Area
- Login and session-protected pages
- Recipe CRUD forms
- Publish/unpublish control

3. Server Layer
- Route handlers or server actions for CRUD
- Input validation and error handling
- Auth checks and permission enforcement

4. Data Layer
- Supabase tables with RLS
- Indexed read patterns for category and published recipes

## 3. Request Flow (Public)

1. User opens app.
2. App fetches active categories and published recipes.
3. User opens recipe detail and starts playback.
4. App attempts embed.
5. If embed unavailable, app exposes direct open to YouTube.

## 4. Request Flow (Admin)

1. Admin logs in with email/password.
2. Authenticated session accesses protected admin pages.
3. Admin submits recipe form.
4. Server validates payload and persists data.
5. Public routes reflect publish state.

## 5. Security Boundaries

- Public routes: read-only published content
- Admin routes: authenticated only
- Server write APIs: authenticated and validated only
- Database: RLS enabled to block unauthorized reads/writes

## 6. Performance Strategy

- Mobile-first UI and small bundle footprint
- Dynamic loading for admin-only features
- Image optimization and responsive sizes
- Cache app shell and recently visited recipe/category pages

## 7. Reliability Strategy

- Online-first for video
- Friendly offline state for cached content
- Fallbacks for network and embed failure

## 8. Deployment Strategy

- `main` branch deploys to Vercel production
- Preview deployments for feature branches
- Supabase migrations managed with versioned SQL files
