# The Shepherd's Crew — website

Next.js 14 (App Router) · TypeScript · Tailwind. No UI library, no animation library.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

## Assets you must supply

The build works without these; the pages will look broken until they exist.

| Path | Notes |
| --- | --- |
| `public/logo-shepherds-crew.png` | **Transparent background.** The file you have sits on a white square — on a dark page it renders as a white box. Re-export with alpha, or trace to SVG. |
| `public/logo-mjf.png` | Same problem: currently a dark grey circle on black. Needs alpha. |
| `public/gallery/worship-01.jpg` … `worship-06.jpg` | Landscape, 1600px wide is plenty. `worship-01` is used twice — hero of the AOWAP card and first gallery tile — so pick a strong one. |
| `public/og.jpg` | 1200×630 social preview. |
| `public/favicon.ico`, `public/apple-touch-icon.png` | |

## Where to edit things

- **All copy** lives in `lib/content.ts`. Ministry-wide facts (name, phones, pillars) live in `lib/site.ts`. Do not edit text inside components.
- **Colours and fonts** are Tailwind theme tokens in `tailwind.config.ts` — `ember`, `gold`, `stage`, `midnight`, `night`, `deep`, `mist`, plus `font-display` and `font-body`.
- **Section padding** comes from the shared `.band` and `.shell` classes in `app/globals.css`. Change spacing there once rather than per-section, or the sections will drift out of rhythm.

## Design notes

The palette is taken from the ministry's own material: the blue stage wash of a night vigil against the ember orange of the logo flame. The signature device is the `BannerRail` — the vertical labelled strip down the left of each section, echoing the roll-up banners that stand behind the platform at every event.

Animation is limited to scroll reveals via `IntersectionObserver`, and they turn off entirely under `prefers-reduced-motion`.

## Database (Supabase)

Registrations from the "Join a program" form are stored in Supabase.

1. Create a Supabase project.
2. Run the migration in `supabase/migrations/` — paste it into the dashboard **SQL Editor**, or use the CLI: `supabase db push`. It creates `public.registrations` with Row Level Security on and no policies, so only the server can read or write it.
3. Set two env vars (see `.env.example`), from **Project Settings → API**:
   - `SUPABASE_URL` — the project URL.
   - `SUPABASE_SERVICE_ROLE_KEY` — the **service_role** secret. Server-only; never expose it to the browser.

Until these are set, `/api/join` validates submissions and returns `{ ok: true, stored: false }` (logged, not stored) instead of failing. To view registrations, use the dashboard **Table Editor** or query with the service role.

## Class portal (CBT)

A secured computer-based-testing portal for class members lives under `/portal`.
Members log in with an **access code** (no passwords); exams are timed and scored
**entirely server-side**, and the answer key is never sent to the browser. See
`docs/portal-architecture.md` for the full design.

Set up:

1. Apply `supabase/migrations/` (schema + Row Level Security).
2. Set `PORTAL_SESSION_SECRET` (a long random string — see `.env.example`) in
   addition to the Supabase vars. It signs session cookies **and** hashes access
   codes, so keep it stable — changing it invalidates every session and code.
3. (Optional demo) run `supabase/seed.sql` for a sample assessment, then
   `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… PORTAL_SESSION_SECRET=… node scripts/seed-portal-demo.mjs`
   to mint a demo member and print a working access code. Log in at `/portal`.

Creating real members and assessments currently happens via SQL / the Supabase
Table Editor; an admin UI is the next build (see the architecture doc).

## Before launch — actual blockers

1. **Supabase env vars are unset**, so `/api/join` accepts submissions and drops them (logs only). Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` and run the migration.
2. **The BFC curriculum in `lib/content.ts` is placeholder.** The three week outlines are standard foundational topics, not yours. Replace them.
3. **`bfc.startsOn` is `null`.** Set a real cohort date. The old flyer said "first week in July" with no year, which now reads as expired.
4. **`/portal` is a stub.** See `docs/portal-architecture.md`.

## Deploy

Vercel, one click. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL` in project env vars. Security headers are already configured in `next.config.mjs`.
