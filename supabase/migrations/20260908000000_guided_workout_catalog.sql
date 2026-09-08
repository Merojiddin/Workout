-- =====================================================================
-- Guided workout catalog sync
-- =====================================================================
-- Adds the per-user document that lets guided sessions built or imported on
-- one device show up on every other device on the same account.
--
-- Safe to run more than once, and safe to run on a live database: it only
-- adds a table, and touches nothing that already exists.
--
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- =====================================================================

create table if not exists public.guided_workout_catalogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  catalog jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Plain (not partial) unique index: upserts use user_id as the conflict
-- arbiter, and a partial index cannot serve one - Postgres rejects it at
-- runtime with 42P10.
create unique index if not exists guided_workout_catalogs_user_id_key
  on public.guided_workout_catalogs (user_id);

alter table public.guided_workout_catalogs enable row level security;

drop policy if exists "Users can view own guided catalog" on public.guided_workout_catalogs;
create policy "Users can view own guided catalog"
  on public.guided_workout_catalogs for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own guided catalog" on public.guided_workout_catalogs;
create policy "Users can insert own guided catalog"
  on public.guided_workout_catalogs for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own guided catalog" on public.guided_workout_catalogs;
create policy "Users can update own guided catalog"
  on public.guided_workout_catalogs for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own guided catalog" on public.guided_workout_catalogs;
create policy "Users can delete own guided catalog"
  on public.guided_workout_catalogs for delete using (auth.uid() = user_id);

drop trigger if exists guided_workout_catalogs_set_updated_at on public.guided_workout_catalogs;
create trigger guided_workout_catalogs_set_updated_at
  before update on public.guided_workout_catalogs
  for each row execute function public.set_updated_at();
