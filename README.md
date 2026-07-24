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

## Before launch — actual blockers

1. **`GOOGLE_SCRIPT_URL` is unset**, so `/api/join` accepts submissions and drops them. Point it at a deployed Apps Script web app or a database.
2. **The BFC curriculum in `lib/content.ts` is placeholder.** The three week outlines are standard foundational topics, not yours. Replace them.
3. **`bfc.startsOn` is `null`.** Set a real cohort date. The old flyer said "first week in July" with no year, which now reads as expired.
4. **`/portal` is a stub.** See `docs/portal-architecture.md`.

## Deploy

Vercel, one click. Set `GOOGLE_SCRIPT_URL` and `NEXT_PUBLIC_SITE_URL` in project env vars. Security headers are already configured in `next.config.mjs`.
