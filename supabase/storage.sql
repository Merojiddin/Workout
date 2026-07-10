-- =====================================================================
-- Step 13 - Supabase Storage for progress photos
-- =====================================================================
-- Run this whole file ONCE in the Supabase SQL Editor (after schema.sql).
--
-- It creates a PRIVATE bucket called "progress-photos" and adds Row Level
-- Security policies so each signed-in user can only touch files inside their
-- own top-level folder (their auth user id).
--
-- Storage layout (one folder per user, one folder per check-in):
--   <user_id>/<checkin_id>/front.jpg
--   <user_id>/<checkin_id>/side.jpg
--   <user_id>/<checkin_id>/back.jpg
--
-- Example:
--   abc-user-id/2026-07-10-checkin/front.jpg
--
-- Because the bucket is PRIVATE, the app reads photos through short-lived
-- signed URLs (see src/services/photoService.js -> getProgressPhotoUrl).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Create the private bucket (id == name == "progress-photos").
--    "public = false" keeps the bucket private. If you'd rather create it
--    from the dashboard: Storage -> New bucket -> name "progress-photos",
--    leave "Public bucket" OFF.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do update set public = false;

-- ---------------------------------------------------------------------
-- 2. Row Level Security policies on storage.objects.
--    storage.foldername(name)[1] is the FIRST folder in the object path,
--    which we set to the user's auth id. Matching it against auth.uid()
--    means a user can only manage files inside their own folder.
-- ---------------------------------------------------------------------

-- Clean re-run: drop old versions first so this file is idempotent.
drop policy if exists "Progress photos - users read own files" on storage.objects;
drop policy if exists "Progress photos - users upload own files" on storage.objects;
drop policy if exists "Progress photos - users update own files" on storage.objects;
drop policy if exists "Progress photos - users delete own files" on storage.objects;

-- Read (download / list) only inside your own folder.
create policy "Progress photos - users read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Upload only inside your own folder.
create policy "Progress photos - users upload own files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update (overwrite / upsert) only inside your own folder.
create policy "Progress photos - users update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete only inside your own folder.
create policy "Progress photos - users delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- Done. The "progress-photos" bucket is private and locked to each user.
-- Test it from the app: Body Check-in page -> add a front/side/back photo
-- while signed in -> save. The files should appear under
-- storage/progress-photos/<your-user-id>/<checkin-id>/.
-- =====================================================================
