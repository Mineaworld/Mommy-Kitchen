# Setup Manual

This manual covers local setup, Supabase setup, and production deployment.

## 1. Prerequisites

- Node.js 20+ and npm
- Supabase account
- Vercel account (for deployment)

## 2. Install Project

```bash
npm install
```

## 3. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Setup Supabase

1. Create a new Supabase project.
2. Open SQL Editor.
3. Run each SQL file in `supabase/migrations/` in order.
4. In Authentication:
- Enable Email/Password provider.
- Create your admin user account.

## 5. Start Local App

```bash
npm run dev
```

Open `http://localhost:3000`.

## 6. Verify Core Flows

1. Public:
- Home -> Category -> Recipe
- Video embed appears
- "Open in YouTube" fallback works

2. Admin:
- Go to `/admin/login`
- Sign in with your Supabase admin account
- Create/edit recipe in `/admin/recipes`
- Assign each recipe to breakfast, lunch, dinner, or any meal

## 7. Seed Initial Content

Add:
- Categories
- Khmer recipe entries (title, thumbnail, category, YouTube link, duration)

Target for MVP: 150 recipes.

## 8. PWA Assets

Add app icons in `public/`:

- `icon-192.png`
- `icon-512.png`

## 9. Build Check

```bash
npm run build
npm run lint
```

## 10. Deploy to Vercel

1. Import this project into Vercel.
2. Set environment variables in Vercel (same as `.env.local`).
3. Deploy.
4. Update `NEXT_PUBLIC_APP_URL` to production URL.
5. In Supabase Auth settings, add redirect URLs for your deployed domain.

## 11. Device QA Checklist

- OPPO A20 (primary):
  - Tap targets feel large enough
  - Video playback is smooth
  - Khmer labels are readable/hearable

- iPhone Safari:
  - Pages load correctly
  - Admin login works
  - Video fallback works

## 12. Troubleshooting

- `401 UNAUTHENTICATED` on admin API:
  - Re-login at `/admin/login`
  - Check Supabase keys in `.env.local`

- Empty public data:
  - Confirm migration ran
  - Confirm categories are `is_active=true`
  - Confirm recipes are `is_published=true`

- Build fails:
  - Run `npm install` again
  - Re-check env vars
