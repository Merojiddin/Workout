# Deployment Guide — Vercel

How to deploy Mike Fitness Tracker (React + Vite + PWA + optional Supabase)
to Vercel.

The app is a static single-page app. It has no server code: everything is
built into `dist/` and served as static files. Supabase (if configured) is
called directly from the browser with the public anon key.

---

## A. Create the Vercel project

1. Sign in at <https://vercel.com> (GitHub login is easiest).
2. Click **Add New… → Project**.

## B. Connect the GitHub repository

1. Push this project to a GitHub repository (private is fine).
2. In Vercel, **Import** that repository.
3. Vercel auto-detects the framework as **Vite**. Keep that preset.

## C. Set the build command

```
npm run build
```

`npm run build` runs `tsc -b && vite build` (type check + production build).
If TypeScript errors ever block an emergency deploy, `npm run build:prod`
(`vite build` only) skips the type check — prefer fixing the error instead.

## D. Set the output directory

```
dist
```

(Install command stays the default `npm install`.)

## E. Add environment variables

In Vercel: **Project → Settings → Environment Variables**, add for the
**Production** environment (and Preview if you want cloud sync in previews):

| Name                     | Value                                        |
| ------------------------ | -------------------------------------------- |
| `VITE_SUPABASE_URL`      | `https://YOUR-PROJECT-REF.supabase.co`       |
| `VITE_SUPABASE_ANON_KEY` | your Supabase **anon** key (never service_role) |
| `VITE_APP_NAME`          | `Mike Fitness Tracker` (optional)            |
| `VITE_APP_ENV`           | `production` (optional)                      |

Both Supabase values come from Supabase dashboard → **Project Settings → API**.

Leave the two Supabase variables out entirely to deploy in **local mode**
(browser storage only, no login). The app handles that safely and shows a
notice in Settings.

> Vite bakes env vars in at **build time**. After adding or changing a
> variable you must trigger a new deployment for it to take effect.

## F. Deploy

Click **Deploy**. First build takes ~1–2 minutes. Every later `git push` to
the connected branch deploys automatically (pushes to other branches create
Preview deployments).

## G. Test the production URL

Open `https://your-project.vercel.app` and run through
[production-test-plan.md](production-test-plan.md), or at minimum:

1. App loads and shows the Dashboard.
2. Refresh the page — it must not 404 (that's what `vercel.json` rewrites fix).
3. Settings → Cloud Sync shows **Cloud mode** (or the local-mode notice).
4. Settings → Cloud Sync → **Cloud Health** → Run Health Check — all green.
5. Register/login works (after Supabase redirect URLs are set — see
   [supabase-production-checklist.md](supabase-production-checklist.md)).
6. Install the PWA (browser menu → Install app), then test airplane mode.

---

## How to redeploy

- **Automatic:** push a commit to the connected branch.
- **Manual:** Vercel dashboard → your project → **Deployments** → `⋯` menu on
  any deployment → **Redeploy**. Use this after changing env variables.

## How to check Vercel logs

- **Build logs:** Deployments → click a deployment → **Build Logs**. This is
  where `npm run build` failures (TypeScript errors, missing deps) show up.
- **Runtime logs:** not applicable — this is a static site with no server
  functions. Runtime errors happen in the browser; use the browser DevTools
  console on the production URL instead.

## How to roll back a deployment

1. Vercel dashboard → project → **Deployments**.
2. Find the last good deployment in the list.
3. `⋯` menu → **Promote to Production** (or "Instant Rollback" on the
   current production deployment).

Rollback is instant — it just re-points the domain at the old static build.

## How to use a custom domain later

1. Vercel dashboard → project → **Settings → Domains** → add
   `fitness.yourdomain.com` (or an apex domain).
2. Follow Vercel's DNS instructions (CNAME to `cname.vercel-dns.com`, or
   Vercel nameservers). HTTPS certificates are automatic.
3. **Important:** add the new domain to Supabase auth settings
   (Authentication → URL Configuration → Site URL + Redirect URLs),
   otherwise login/password-reset emails will point at the old URL.
4. PWA note: the service worker is scoped per-origin. Users who installed
   the app from the `.vercel.app` URL keep that origin; they should
   reinstall from the custom domain.
