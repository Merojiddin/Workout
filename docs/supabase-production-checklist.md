# Supabase Production Checklist

Work through this list once before the first production deployment, and again
whenever the Supabase project or the production domain changes.

Replace `https://your-vercel-domain.vercel.app` everywhere below with your
real Vercel production URL (do not hardcode it in the repo).

## Database

- [ ] **1. Supabase project created** — a dedicated project for this app
      (Supabase dashboard → New project). Save the database password somewhere
      safe; the app never needs it.
- [ ] **2. `supabase/schema.sql` executed** — dashboard → SQL Editor → paste
      the full contents of [`supabase/schema.sql`](../supabase/schema.sql) →
      Run. Safe to re-run. Creates `workout_sessions`, `workout_sets`, `body_check_ins`,
      `nutrition_logs`, `custom_workout_plans`,
      `custom_exercise_libraries`, `user_settings`,
      `user_workout_programs`.
- [ ] **3. `supabase/storage.sql` executed** — same SQL Editor, contents of
      [`supabase/storage.sql`](../supabase/storage.sql). Creates the private
      `progress-photos` bucket and its policies.
- [ ] **4. RLS enabled on all tables** — dashboard → Database → Tables: every
      app table must show "RLS enabled". `schema.sql` enables it; verify none
      were created outside it.

## Storage

- [ ] **5. Storage bucket `progress-photos` created** — dashboard → Storage.
- [ ] **6. Bucket is private** — the bucket must NOT be marked Public. Photos
      are read through short-lived signed URLs only.
- [ ] **7. Storage policies tested** — log in as test user A, upload a
      check-in photo, confirm it displays. Then log in as user B and confirm
      user A's photo is not accessible (the app scopes objects to
      `<user_id>/...` folders).

## Auth

- [ ] **8. Auth redirect URLs configured** — dashboard → Authentication →
      URL Configuration:
      - **Site URL:** `https://your-vercel-domain.vercel.app`
      - **Redirect URLs** must include:
        - `http://localhost:5173`
        - `http://localhost:5174` (this project's dev port)
        - `https://your-vercel-domain.vercel.app`
- [ ] **9. Vercel production URL added** — after the first deploy, confirm the
      real `*.vercel.app` URL (and any custom domain later) is in both Site
      URL and Redirect URLs. Password-reset emails use these.
- [ ] **10. Localhost still allowed for development** — keep the localhost
      entries in Redirect URLs so `npm run dev` login and password reset keep
      working.

## Final verification

- [ ] Email signups enabled (Authentication → Providers → Email), and decide
      whether "Confirm email" is on (recommended for production).
- [ ] Register + login work on the production URL.
- [ ] Settings → Cloud Sync → Cloud Health → **Run Health Check** shows
      Database reachable: Yes and Storage available: Yes while logged in.
- [ ] The **service_role** key is not used anywhere in this repo (frontend
      uses only the anon key — see [security-checklist.md](security-checklist.md)).
