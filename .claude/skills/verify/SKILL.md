---
name: verify
description: Build, launch, and drive the Workout app to verify changes at the browser surface.
---

# Verifying the Workout app

React 19 + TypeScript + Vite PWA, localStorage-only in local mode (no login
when Supabase env vars are absent — `.env.example` only, no `.env`).

## Build / lint

```bash
cd "/Users/merojiddin/Desktop/Workout "   # NOTE: trailing space in path
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

## Launch

`npm run dev` serves on **http://localhost:5174** (strictPort). The user's own
dev server is often already running on 5174 — check with
`curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/` and drive
against it instead of starting another (Vite HMR keeps it current).

## Drive (Playwright)

No Playwright in project deps, but the browser cache exists at
`~/Library/Caches/ms-playwright`. `npm install playwright` in the scratchpad
and `chromium.launch()` works with the cached build.

- App is a SPA without URL routing: navigate by clicking nav buttons
  (`getByRole('button', { name: 'Exercise Library', exact: true })`).
  Sidebar labels on desktop (>=920px); bottom nav labels on mobile:
  Home / Workout / Coach / Progress / More.
- Sidebar/dashboard have duplicate button names — use `exact: true` or
  `.first()`.
- During a live workout (`Start Workout`) the bottom nav is hidden
  (`.app-shell--today-workout`); to leave, finish/discard the workout or use a
  fresh context.
- Playwright contexts have isolated localStorage — the user's real data is
  never touched. Seed test data via
  `localStorage.setItem('customExerciseLibrary', ...)` + reload.
- Mobile viewport: 390x844, `isMobile: true`. Settings tabs are
  `getByRole('tab', { name: ... })`.

## Evidence convention

Screenshots go to `artifacts/verification/stepNN-<what>.png`.
