---
name: verify
description: Build, launch, and drive the Workout app to verify changes at the browser surface.
---

# Verifying the Workout app

React 19 + TypeScript + Vite PWA. localStorage is always the working store;
Supabase is an optional write-through layer.

## Build / lint

```bash
cd "/Users/merojiddin/Desktop/Workout "   # NOTE: trailing space in path
npm run build   # tsc -b && vite build
npm run lint    # oxlint
npm run verify:v2.1        # 450 assertions, program/progression/CSV
npm run verify:plan-reset  # plan reset isolation
```

## Launch

`npm run dev` serves on **http://localhost:5174** (strictPort), and the user's
own server is usually already there.

**`.env.local` now has real `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, so
that server shows a login wall ("Welcome back") and cannot be driven without
credentials.** To get local mode (no login), run a second server whose `envDir`
points at an empty directory:

```bash
# vite.verify.config.ts in the project root (delete it afterwards)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  envDir: '<scratchpad>/emptyenv',   // must exist and be empty
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
```

`npx vite --config vite.verify.config.ts`. The config must live inside the
project or it cannot resolve `vite`/`@vitejs/plugin-react`.

## Drive (Playwright)

No Playwright in project deps, but the browser cache exists at
`~/Library/Caches/ms-playwright`. `npm install playwright` in the scratchpad,
then launch with an explicit `executablePath` for the cached headless shell
(`chromium_headless_shell-<rev>/chrome-headless-shell-mac-arm64/chrome-headless-shell`)
— the bundled revision is usually a version ahead of the cache.

- SPA without URL routing: navigate by clicking nav buttons. There are exactly
  three destinations — **Workout / Nutrition / More** — as `.bottom-nav__button`
  on mobile and `.nav-button` in the sidebar at >=920px. Everything else
  (Weekly Plan, Exercise Library, Weekly Review, Body Check-in, Settings) is a
  `.more-list__item` on the More page.
- Today's Workout is the home page. The nav is visible everywhere **except**
  the live workout screen, which is a full-screen `position: fixed` layer
  (`.workout-page--live`) covering the top bar and bottom nav.
- Workout flow: `Start workout` -> live screen -> `.live-tool--end` (the "End"
  tool, which `window.confirm`s while sets are left) -> `.finish-screen` ->
  `Done`. The live screen is three fixed rows: `.live-header` (with
  `.live-header__exit`, which leaves for the unfinished-workout prompt without
  ending the session), the scrolling `.live-body`, and `.live-dock`.
- Everything pressed between sets is in `.live-dock`: the `.rest-timer` line
  (`.timer-button` x3), `.live-dock__main` (`.live-dock__back` +
  `.workout-primary-button` labelled Next set / Next exercise / Finish
  workout), and `.live-dock__tools` (four `.live-tool` buttons: Log set, Skip,
  List, End). Optional logging is behind the first `.live-tool`
  (`#optional-log-primary`, `#optional-log-weight`); the exercise list opens as
  a `.live-sheet` over the screen.
- Playwright contexts have isolated localStorage — the user's real data is
  never touched. Seed test data via
  `localStorage.setItem('customExerciseLibrary', ...)` + reload.
- Mobile viewport: 390x844, `isMobile: true`. Settings tabs are
  `getByRole('tab', { name: ... })`; the program manager / paste-a-program is
  the **Program** tab.
- `fullPage: true` screenshots place `position: fixed` elements (the bottom
  nav) mid-page, which looks like an overlap bug but is not. To check real
  clearance, scroll to the bottom and compare `getBoundingClientRect()` of the
  last element against `.bottom-nav`.
- The Exercise Library is legitimately ~90,000px tall on mobile (156 cards in
  one column). That is not a layout regression.

## Evidence convention

Screenshots go to `artifacts/verification/<topic>-NN-<what>.png`.
