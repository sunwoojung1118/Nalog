-- Phase 2: social graph + log posts + communities.
-- Builds on 20260617000001_init.sql.

create extension if not exists pgcrypto;

-- ============================================================
-- profiles: add bio + open SELECT to any authenticated user.
-- ============================================================
alter table public.profiles add column bio text not null default '';

create policy "profiles_select_any_authenticated" on public.profiles
  for select to authenticated using (true);

-- Carry bio through signup metadata alongside display_name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce(new.raw_user_meta_data->>'bio', '')
  );
  return new;
end;
$$;

-- ============================================================
-- follows: directed (follower → followed).
-- Visible to any authenticated user. Writes are own-only.
-- ============================================================
create table public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create index follows_followed_idx on public.follows (followed_id);

alter table public.follows enable row level security;

create policy "follows_select_any_authenticated" on public.follows
  for select to authenticated using (true);

create policy "follows_insert_own" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "follows_delete_own" on public.follows
  for delete using (auth.uid() = follower_id);

-- ============================================================
-- week_published: replace own-only SELECT with author + followers.
-- ============================================================
drop policy "week_published_select_own" on public.week_published;

create policy "week_published_select_visible" on public.week_published
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.follows
      where follower_id = auth.uid() and followed_id = week_published.user_id
    )
  );

-- ============================================================
-- log_posts: long-form posts, distinct from the weekly journal.
-- Visible to author + their followers; writes are own-only.
-- ============================================================
create table public.log_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index log_posts_user_idx on public.log_posts (user_id, published_at desc);

alter table public.log_posts enable row level security;

create policy "log_posts_select_visible" on public.log_posts
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.follows
      where follower_id = auth.uid() and followed_id = log_posts.user_id
    )
  );

create policy "log_posts_insert_own" on public.log_posts
  for insert with check (auth.uid() = user_id);

create policy "log_posts_update_own" on public.log_posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "log_posts_delete_own" on public.log_posts
  for delete using (auth.uid() = user_id);

create trigger log_posts_touch
  before update on public.log_posts
  for each row execute function public.touch_updated_at();

-- ============================================================
-- communities: public groups, created by users.
-- Tag is case-insensitively unique.
-- ============================================================
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null,
  blurb text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index communities_tag_idx on public.communities (lower(tag));

alter table public.communities enable row level security;

create policy "communities_select_any_authenticated" on public.communities
  for select to authenticated using (true);

create policy "communities_insert_own" on public.communities
  for insert with check (auth.uid() = created_by);

create policy "communities_update_creator" on public.communities
  for update using (auth.uid() = created_by) with check (auth.uid() = created_by);

create trigger communities_touch
  before update on public.communities
  for each row execute function public.touch_updated_at();

-- ============================================================
-- community_members: join table for community membership.
-- Public reads (so member counts are visible); self-only writes.
-- ============================================================
create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create index community_members_user_idx on public.community_members (user_id);

alter table public.community_members enable row level security;

create policy "community_members_select_any_authenticated" on public.community_members
  for select to authenticated using (true);

create policy "community_members_insert_own" on public.community_members
  for insert with check (auth.uid() = user_id);

create policy "community_members_delete_own" on public.community_members
  for delete using (auth.uid() = user_id);
