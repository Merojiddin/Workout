-- =====================================================================
-- Step 12 - Supabase schema for the Workout app
-- =====================================================================
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- Every table is protected by Row Level Security so each authenticated
-- user can only read and write their OWN rows (auth.uid() = user_id).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- profiles
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  height_cm numeric,
  starting_weight_kg numeric,
  current_weight_kg numeric,
  goal_weight_min_kg numeric,
  goal_weight_max_kg numeric,
  training_goal text,
  main_focus text,
  experience_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can delete own profile"
  on public.profiles for delete using (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- workout_sessions
-- =====================================================================
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  local_id text,
  date date,
  workout_day_id text,
  workout_name text,
  started_at timestamptz,
  finished_at timestamptz,
  duration_minutes numeric,
  completed boolean default false,
  overall_rpe numeric,
  notes text,
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One cloud row per (user, local_id) so re-running sync never duplicates.
create unique index if not exists workout_sessions_user_local_id_key
  on public.workout_sessions (user_id, local_id)
  where local_id is not null;

alter table public.workout_sessions enable row level security;

create policy "Users can view own workout sessions"
  on public.workout_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own workout sessions"
  on public.workout_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own workout sessions"
  on public.workout_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own workout sessions"
  on public.workout_sessions for delete using (auth.uid() = user_id);

create trigger workout_sessions_set_updated_at
  before update on public.workout_sessions
  for each row execute function public.set_updated_at();

-- =====================================================================
-- workout_sets
-- =====================================================================
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid references public.workout_sessions(id) on delete cascade,
  exercise_id text,
  exercise_name text,
  set_number integer,
  reps numeric,
  weight_kg numeric,
  time_seconds numeric,
  rpe numeric,
  pain_level numeric,
  notes text,
  completed_at timestamptz,
  raw_data jsonb,
  created_at timestamptz default now()
);

create index if not exists workout_sets_session_id_idx
  on public.workout_sets (session_id);

alter table public.workout_sets enable row level security;

create policy "Users can view own workout sets"
  on public.workout_sets for select using (auth.uid() = user_id);
create policy "Users can insert own workout sets"
  on public.workout_sets for insert with check (auth.uid() = user_id);
create policy "Users can update own workout sets"
  on public.workout_sets for update using (auth.uid() = user_id);
create policy "Users can delete own workout sets"
  on public.workout_sets for delete using (auth.uid() = user_id);

-- =====================================================================
-- body_check_ins
-- =====================================================================
create table if not exists public.body_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  local_id text,
  date date,
  body_weight_kg numeric,
  waist_cm numeric,
  belly_cm numeric,
  chest_cm numeric,
  shoulders_cm numeric,
  left_arm_cm numeric,
  right_arm_cm numeric,
  hips_cm numeric,
  posture_rating numeric,
  abs_visibility_rating numeric,
  energy_level numeric,
  sleep_quality numeric,
  notes text,
  front_photo_url text,
  side_photo_url text,
  back_photo_url text,
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists body_check_ins_user_local_id_key
  on public.body_check_ins (user_id, local_id)
  where local_id is not null;

alter table public.body_check_ins enable row level security;

create policy "Users can view own body check ins"
  on public.body_check_ins for select using (auth.uid() = user_id);
create policy "Users can insert own body check ins"
  on public.body_check_ins for insert with check (auth.uid() = user_id);
create policy "Users can update own body check ins"
  on public.body_check_ins for update using (auth.uid() = user_id);
create policy "Users can delete own body check ins"
  on public.body_check_ins for delete using (auth.uid() = user_id);

create trigger body_check_ins_set_updated_at
  before update on public.body_check_ins
  for each row execute function public.set_updated_at();

-- =====================================================================
-- nutrition_logs
-- =====================================================================
create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  local_id text,
  date date,
  body_weight_kg numeric,
  protein_grams numeric,
  water_liters numeric,
  calories_estimate numeric,
  creatine_taken boolean,
  creatine_grams numeric,
  whey_taken boolean,
  whey_scoops numeric,
  eggs_count numeric,
  seafood_meal boolean,
  oysters_meal boolean,
  nuts_serving boolean,
  dark_chocolate boolean,
  fruits text,
  coffee_cups numeric,
  notes text,
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists nutrition_logs_user_local_id_key
  on public.nutrition_logs (user_id, local_id)
  where local_id is not null;

alter table public.nutrition_logs enable row level security;

create policy "Users can view own nutrition logs"
  on public.nutrition_logs for select using (auth.uid() = user_id);
create policy "Users can insert own nutrition logs"
  on public.nutrition_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own nutrition logs"
  on public.nutrition_logs for update using (auth.uid() = user_id);
create policy "Users can delete own nutrition logs"
  on public.nutrition_logs for delete using (auth.uid() = user_id);

create trigger nutrition_logs_set_updated_at
  before update on public.nutrition_logs
  for each row execute function public.set_updated_at();

-- =====================================================================
-- custom_workout_plans  (one row per user)
-- =====================================================================
create table if not exists public.custom_workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists custom_workout_plans_user_id_key
  on public.custom_workout_plans (user_id);

alter table public.custom_workout_plans enable row level security;

create policy "Users can view own workout plan"
  on public.custom_workout_plans for select using (auth.uid() = user_id);
create policy "Users can insert own workout plan"
  on public.custom_workout_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own workout plan"
  on public.custom_workout_plans for update using (auth.uid() = user_id);
create policy "Users can delete own workout plan"
  on public.custom_workout_plans for delete using (auth.uid() = user_id);

create trigger custom_workout_plans_set_updated_at
  before update on public.custom_workout_plans
  for each row execute function public.set_updated_at();

-- =====================================================================
-- custom_exercise_libraries  (one row per user)
-- =====================================================================
create table if not exists public.custom_exercise_libraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  library jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists custom_exercise_libraries_user_id_key
  on public.custom_exercise_libraries (user_id);

alter table public.custom_exercise_libraries enable row level security;

create policy "Users can view own exercise library"
  on public.custom_exercise_libraries for select using (auth.uid() = user_id);
create policy "Users can insert own exercise library"
  on public.custom_exercise_libraries for insert with check (auth.uid() = user_id);
create policy "Users can update own exercise library"
  on public.custom_exercise_libraries for update using (auth.uid() = user_id);
create policy "Users can delete own exercise library"
  on public.custom_exercise_libraries for delete using (auth.uid() = user_id);

create trigger custom_exercise_libraries_set_updated_at
  before update on public.custom_exercise_libraries
  for each row execute function public.set_updated_at();

-- =====================================================================
-- user_settings  (one row per user)
-- =====================================================================
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  settings jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists user_settings_user_id_key
  on public.user_settings (user_id);

alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings"
  on public.user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings"
  on public.user_settings for update using (auth.uid() = user_id);
create policy "Users can delete own settings"
  on public.user_settings for delete using (auth.uid() = user_id);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Done. Every table now enforces per-user Row Level Security.
-- =====================================================================
