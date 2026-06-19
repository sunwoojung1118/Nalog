-- Nalog initial schema: profiles + week_drafts + week_published with RLS.
-- All tables are user-scoped via auth.uid(); the publishable anon key never
-- sees rows belonging to other users.

-- ============================================================
-- profiles: one row per auth user, created automatically on signup.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Shared helper: bump updated_at on row update.
-- ============================================================
create function public.touch_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================
-- week_drafts: editable surface. One row per (user, year, week).
-- Year is included so week numbers don't collide across years.
-- ============================================================
create table public.week_drafts (
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  week_number int not null check (week_number between 1 and 53),
  title text not null default '',
  day_1_subtitle text not null default '',
  day_1_body text not null default '',
  day_2_subtitle text not null default '',
  day_2_body text not null default '',
  day_3_subtitle text not null default '',
  day_3_body text not null default '',
  day_4_subtitle text not null default '',
  day_4_body text not null default '',
  day_5_subtitle text not null default '',
  day_5_body text not null default '',
  day_6_subtitle text not null default '',
  day_6_body text not null default '',
  day_7_subtitle text not null default '',
  day_7_body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, year, week_number)
);

alter table public.week_drafts enable row level security;

create policy "week_drafts_select_own" on public.week_drafts
  for select using (auth.uid() = user_id);

create policy "week_drafts_insert_own" on public.week_drafts
  for insert with check (auth.uid() = user_id);

create policy "week_drafts_update_own" on public.week_drafts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "week_drafts_delete_own" on public.week_drafts
  for delete using (auth.uid() = user_id);

create trigger week_drafts_touch
  before update on public.week_drafts
  for each row execute function public.touch_updated_at();

-- ============================================================
-- week_published: snapshot of week_drafts at publish time.
-- RLS is own-only for now; we'll relax for the social feed later.
-- ============================================================
create table public.week_published (
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  week_number int not null check (week_number between 1 and 53),
  title text not null default '',
  day_1_subtitle text not null default '',
  day_1_body text not null default '',
  day_2_subtitle text not null default '',
  day_2_body text not null default '',
  day_3_subtitle text not null default '',
  day_3_body text not null default '',
  day_4_subtitle text not null default '',
  day_4_body text not null default '',
  day_5_subtitle text not null default '',
  day_5_body text not null default '',
  day_6_subtitle text not null default '',
  day_6_body text not null default '',
  day_7_subtitle text not null default '',
  day_7_body text not null default '',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, year, week_number)
);

alter table public.week_published enable row level security;

create policy "week_published_select_own" on public.week_published
  for select using (auth.uid() = user_id);

create policy "week_published_insert_own" on public.week_published
  for insert with check (auth.uid() = user_id);

create policy "week_published_update_own" on public.week_published
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "week_published_delete_own" on public.week_published
  for delete using (auth.uid() = user_id);

create trigger week_published_touch
  before update on public.week_published
  for each row execute function public.touch_updated_at();
