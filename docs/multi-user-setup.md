# Multi-user setup (3 accounts)

The app currently runs in **local mode**: `.env.local` has no Supabase values,
so `isSupabaseConfigured` is false, `ProtectedRoute` skips the login screen
entirely, and all data lives in this browser only. Everything below turns on
real accounts.

## 1. Supabase project

1. Create a project at <https://supabase.com> (the free tier is enough for
   three people).
2. Open **SQL Editor** and run, in order:
   - `supabase/schema.sql`
   - `supabase/storage.sql`
3. Open **Project Settings → API** and copy the **Project URL** and the
   **anon / public** key. Never copy the `service_role` key into this app.

## 2. Local environment

Put the two values in `.env.local`:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon key>
```

Restart `npm run dev`. The login screen now appears.

## 3. Vercel environment

Add the same two variables in **Vercel → Project → Settings → Environment
Variables** (Production, Preview, and Development), then redeploy. Without
them the deployed app silently stays in local mode with no login.

## 4. Create the three accounts

Each person registers with their own email on the login screen. If you would
rather not have open sign-ups, create the three users in **Supabase →
Authentication → Users** and turn off public sign-ups in
**Authentication → Providers → Email**.

Consider turning **Confirm email** off for a private three-person app, or the
first sign-in waits on a confirmation email.

## How accounts stay separated

Local storage is namespaced per user: every key is written as
`u:<userId>:<key>` while someone is signed in. Signing in as a different
account switches the namespace, so one person's history is not merely hidden
from another - it is unreachable through the normal read path, and cannot be
uploaded into the wrong cloud account.

Two consequences worth knowing:

- **Nothing is ever adopted across accounts.** No data is migrated into a new
  namespace, so an account only ever sees what it created itself. A new account
  starts completely empty - including its workout program, which it must upload
  before the app will show a workout.
- **Signing out does not delete anything.** The data stays under that user's
  namespace and comes back when they sign in again.

Each person can safely share one phone, though everyone having their own
device is still the smoother experience.

## Workout programs are per account

No program ships with the app. On first sign-in an account lands on **Add your
workout program** and must upload a program `.json` file (or paste the JSON);
it is saved under that account's own namespace and synced to that account's
cloud row only. One person's program is never visible or installable by
another.

The exercise **library** is the exception and is shared by everyone: it is
bundled with the app, and uploaded programs are validated against it.

A reference program is kept at `public/programs/research-recomp-boxing-v2.1.json`
and can be downloaded from the running app at `/programs/research-recomp-boxing-v2.1.json`
if you want to re-upload it.

## Password resets

Opening the emailed reset link signs the user in with a temporary recovery
session, and the app then shows the "Choose a new password" screen before
letting them back into the app. For this to work, add your deployed URL under
**Supabase → Authentication → URL Configuration → Redirect URLs**.
