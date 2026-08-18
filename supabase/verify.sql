-- =====================================================================
-- Post-setup verification
-- =====================================================================
-- Run AFTER schema.sql and storage.sql. Every row should read "ok".
-- =====================================================================

-- 1. All 8 app tables exist, and every one has RLS enabled.
select
  t.table_name,
  case when c.relrowsecurity then 'ok - RLS on' else 'FAIL - RLS OFF' end as rls,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.table_name) as policies
from information_schema.tables t
join pg_class c on c.relname = t.table_name
join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
where t.table_schema = 'public'
  and t.table_name in (
    'workout_sessions', 'workout_sets', 'body_check_ins', 'nutrition_logs',
    'custom_workout_plans', 'custom_exercise_libraries', 'user_settings',
    'user_workout_programs')
order by t.table_name;
-- Expect: 8 rows, all "ok - RLS on", each with 4 policies.

-- 2. The private progress-photos bucket exists and is NOT public.
select
  id,
  case when public then 'FAIL - bucket is public' else 'ok - private' end as visibility
from storage.buckets
where id = 'progress-photos';
-- Expect: 1 row, "ok - private".

-- 3. Storage policies are scoped to the signed-in user's own folder.
select policyname
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like 'Progress photos%'
order by policyname;
-- Expect: 4 rows (read / upload / update / delete).
