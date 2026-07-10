# Security Checklist

Review before every production deployment.

## Frontend

- [ ] **No Supabase service_role key in the frontend.** Search the repo:
      `grep -ri "service_role" src/` must return nothing. Only the public
      **anon** key is used ([src/lib/supabaseClient.js](../src/lib/supabaseClient.js)).
- [ ] **Only the anon key is exposed.** The anon key is safe to ship because
      every table is protected by Row Level Security — the key alone grants
      nothing.
- [ ] **No secrets in code.** No API keys, passwords, or tokens hardcoded in
      `src/`. All configuration comes from `VITE_*` env vars.
- [ ] **Env files ignored.** `.env`, `.env.local`, `.env.production` are in
      `.gitignore`; only `.env.example` and `.env.local.example` are
      committed. Verify: `git status` never lists a real `.env` file.
- [ ] **User data protected by RLS.** The frontend never filters "security"
      client-side; the database enforces ownership.

## Supabase

- [ ] **RLS enabled** on every app table (`profiles`, `workout_sessions`,
      `workout_sets`, `body_check_ins`, `nutrition_logs`,
      `custom_workout_plans`, `custom_exercise_libraries`, `user_settings`).
- [ ] **Users can only access their own rows.** All policies compare
      `auth.uid()` to the row's `user_id` (see
      [supabase/schema.sql](../supabase/schema.sql)).
- [ ] **Storage policies restrict folders by user id.** The private
      `progress-photos` bucket only allows reads/writes inside
      `<auth.uid()>/...` paths (see [supabase/storage.sql](../supabase/storage.sql)).
- [ ] **Auth redirect URLs set correctly.** Only localhost and the real
      production domain(s) — no wildcards, no stale preview URLs
      (see [supabase-production-checklist.md](supabase-production-checklist.md)).

## Data & privacy

- [ ] **Export backups contain personal fitness data** (weight, measurements,
      photos as base64, notes). Treat exported JSON files as private
      documents — don't share or upload them.
- [ ] **Users are warned before destructive or sensitive actions.** The app
      confirms before importing over existing data, clearing all data, and
      syncing (already implemented in Settings / Data Health / Cloud Sync).
- [ ] **Photos are private when cloud sync is used.** Bucket is not public;
      the app displays photos through short-lived signed URLs only.
- [ ] **Privacy notice and disclaimer pages are reachable** from the Settings
      footer (`src/pages/Privacy.jsx`, `src/pages/Disclaimer.jsx`).
