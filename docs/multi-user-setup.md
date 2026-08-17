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

- **Existing data on a device is adopted by the first account that signs in
  there.** That is deliberate: the un-namespaced data predates accounts and
  belongs to whoever was using the app. Every later account starts clean. The
  decision is recorded in the `legacyLocalDataClaim` key.
- **Signing out does not delete anything.** The data stays under that user's
  namespace and comes back when they sign in again.

Each person can safely share one phone, though everyone having their own
device is still the smoother experience.

## Password resets

Opening the emailed reset link signs the user in with a temporary recovery
session, and the app then shows the "Choose a new password" screen before
letting them back into the app. For this to work, add your deployed URL under
**Supabase → Authentication → URL Configuration → Redirect URLs**.
