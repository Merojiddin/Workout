-- =====================================================================
-- Repair: upsert arbiters on workout_sessions / body_check_ins /
--         nutrition_logs
-- =====================================================================
-- Symptom this fixes: finished workouts stay on the device that logged them.
-- Nothing appears on a second device, and Settings -> "Upload to cloud"
-- reports errors for every session.
--
-- Cause: these three tables were created with a PARTIAL unique index
-- (`where local_id is not null`). Postgres only accepts a partial unique index
-- as an ON CONFLICT arbiter if the statement repeats the index predicate, and
-- PostgREST cannot emit one. So every `upsert(..., { onConflict:
-- 'user_id,local_id' })` the app sends failed with:
--
--   42P10  there is no unique or exclusion constraint matching the
--          ON CONFLICT specification
--
-- The app catches that, keeps the record in localStorage and parks it in the
-- offline queue, which is why the failure is invisible in the UI.
--
-- Nulls are distinct in a unique index, so removing the predicate preserves
-- the original guarantee: one cloud row per (user_id, local_id).
--
-- Safe to re-run. Indexes only - no table or row is touched.
-- (schema.sql now carries the same fix, so applying that whole file works too.)
-- =====================================================================

drop index if exists public.workout_sessions_user_local_id_key;
create unique index if not exists workout_sessions_user_local_id_key
  on public.workout_sessions (user_id, local_id);

drop index if exists public.body_check_ins_user_local_id_key;
create unique index if not exists body_check_ins_user_local_id_key
  on public.body_check_ins (user_id, local_id);

drop index if exists public.nutrition_logs_user_local_id_key;
create unique index if not exists nutrition_logs_user_local_id_key
  on public.nutrition_logs (user_id, local_id);

-- Verify: all three must report "ok - usable as arbiter".
select
  i.indexrelid::regclass as index_name,
  case
    when i.indpred is null then 'ok - usable as arbiter'
    else 'FAIL - still partial'
  end as status
from pg_index i
where i.indexrelid::regclass::text in (
  'workout_sessions_user_local_id_key',
  'body_check_ins_user_local_id_key',
  'nutrition_logs_user_local_id_key')
order by 1;
