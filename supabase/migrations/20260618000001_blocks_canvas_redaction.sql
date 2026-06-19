-- Phase 5: rich blocks + canvas image objects + account privacy
--          + server-side block redaction + view counts + comments.
--
-- Strategy: additive. Old `day_X_body`, `day_X_image_path`, `day_X_caption`
-- text columns are kept for backwards-compat but are no longer the source
-- of truth; the application now reads/writes the new jsonb columns.

-- ============================================================
-- profiles.is_private — whole-account gate.
-- ============================================================
alter table public.profiles
  add column if not exists is_private boolean not null default false;

alter table public.profiles
  add column if not exists readme text not null default '';

alter table public.profiles
  add constraint profiles_readme_len check (char_length(readme) <= 20000);

-- ============================================================
-- jsonb storage for rich blocks + canvas images on every day,
-- on both draft and published tables. Bounded sizes.
-- ============================================================
alter table public.week_drafts
  add column if not exists day_1_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_2_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_3_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_4_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_5_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_6_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_7_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_1_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_2_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_3_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_4_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_5_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_6_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_7_canvas jsonb not null default '[]'::jsonb;

alter table public.week_published
  add column if not exists day_1_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_2_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_3_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_4_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_5_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_6_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_7_blocks jsonb not null default '[]'::jsonb,
  add column if not exists day_1_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_2_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_3_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_4_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_5_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_6_canvas jsonb not null default '[]'::jsonb,
  add column if not exists day_7_canvas jsonb not null default '[]'::jsonb;

-- Bound jsonb payload sizes (octet_length on the text representation).
alter table public.week_published
  add constraint wp_blocks_size check (
    octet_length(day_1_blocks::text) <= 65536 and
    octet_length(day_2_blocks::text) <= 65536 and
    octet_length(day_3_blocks::text) <= 65536 and
    octet_length(day_4_blocks::text) <= 65536 and
    octet_length(day_5_blocks::text) <= 65536 and
    octet_length(day_6_blocks::text) <= 65536 and
    octet_length(day_7_blocks::text) <= 65536
  ),
  add constraint wp_canvas_size check (
    jsonb_array_length(day_1_canvas) <= 5 and
    jsonb_array_length(day_2_canvas) <= 5 and
    jsonb_array_length(day_3_canvas) <= 5 and
    jsonb_array_length(day_4_canvas) <= 5 and
    jsonb_array_length(day_5_canvas) <= 5 and
    jsonb_array_length(day_6_canvas) <= 5 and
    jsonb_array_length(day_7_canvas) <= 5
  );

alter table public.week_drafts
  add constraint wd_blocks_size check (
    octet_length(day_1_blocks::text) <= 65536 and
    octet_length(day_2_blocks::text) <= 65536 and
    octet_length(day_3_blocks::text) <= 65536 and
    octet_length(day_4_blocks::text) <= 65536 and
    octet_length(day_5_blocks::text) <= 65536 and
    octet_length(day_6_blocks::text) <= 65536 and
    octet_length(day_7_blocks::text) <= 65536
  ),
  add constraint wd_canvas_size check (
    jsonb_array_length(day_1_canvas) <= 5 and
    jsonb_array_length(day_2_canvas) <= 5 and
    jsonb_array_length(day_3_canvas) <= 5 and
    jsonb_array_length(day_4_canvas) <= 5 and
    jsonb_array_length(day_5_canvas) <= 5 and
    jsonb_array_length(day_6_canvas) <= 5 and
    jsonb_array_length(day_7_canvas) <= 5
  );

-- ============================================================
-- Redaction primitives.
-- Pure SQL, immutable. Strips the text of any block with `private: true`,
-- substitutes a fixed bar string, and erases the `private` flag so
-- non-authorized clients cannot even detect that a block was private.
-- ============================================================
create or replace function public.redact_blocks(blocks jsonb, full_access boolean)
returns jsonb
language sql
immutable
as $$
  select case
    when full_access then blocks
    when blocks is null or jsonb_typeof(blocks) <> 'array' then blocks
    else (
      select coalesce(jsonb_agg(
        case
          when (b->>'private')::boolean is true then
            jsonb_build_object(
              'id', b->'id',
              'type', b->'type',
              'text', '████████',
              'redacted', true
            )
          else b
        end
      ), '[]'::jsonb)
      from jsonb_array_elements(blocks) b
    )
  end
$$;

-- Viewer can see full row content if author OR an accepted follower.
create or replace function public.viewer_can_see_full(target_user uuid)
returns boolean
language sql
stable
security invoker
set search_path = public, pg_catalog
as $$
  select
    auth.uid() = target_user
    or exists (
      select 1 from public.follows
      where follower_id = auth.uid() and followed_id = target_user
    );
$$;

-- ============================================================
-- Update week_published RLS: row is visible if
--   author, or follower, or target is a public profile.
-- The private-block redaction happens in the view below.
-- ============================================================
drop policy if exists "week_published_select_visible" on public.week_published;

create policy "week_published_select_v2" on public.week_published
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.follows
      where follower_id = auth.uid() and followed_id = week_published.user_id
    )
    or exists (
      select 1 from public.profiles p
      where p.id = week_published.user_id and p.is_private = false
    )
  );

-- ============================================================
-- Redacted feed view. Clients SELECT from public.week_feed.
-- ============================================================
create or replace view public.week_feed
with (security_invoker = true)
as
select
  wp.user_id,
  wp.year,
  wp.week_number,
  wp.title,
  wp.published_at,
  wp.day_1_subtitle, wp.day_2_subtitle, wp.day_3_subtitle, wp.day_4_subtitle,
  wp.day_5_subtitle, wp.day_6_subtitle, wp.day_7_subtitle,
  wp.day_1_caption, wp.day_2_caption, wp.day_3_caption, wp.day_4_caption,
  wp.day_5_caption, wp.day_6_caption, wp.day_7_caption,
  public.redact_blocks(wp.day_1_blocks, public.viewer_can_see_full(wp.user_id)) as day_1_blocks,
  public.redact_blocks(wp.day_2_blocks, public.viewer_can_see_full(wp.user_id)) as day_2_blocks,
  public.redact_blocks(wp.day_3_blocks, public.viewer_can_see_full(wp.user_id)) as day_3_blocks,
  public.redact_blocks(wp.day_4_blocks, public.viewer_can_see_full(wp.user_id)) as day_4_blocks,
  public.redact_blocks(wp.day_5_blocks, public.viewer_can_see_full(wp.user_id)) as day_5_blocks,
  public.redact_blocks(wp.day_6_blocks, public.viewer_can_see_full(wp.user_id)) as day_6_blocks,
  public.redact_blocks(wp.day_7_blocks, public.viewer_can_see_full(wp.user_id)) as day_7_blocks,
  wp.day_1_canvas, wp.day_2_canvas, wp.day_3_canvas, wp.day_4_canvas,
  wp.day_5_canvas, wp.day_6_canvas, wp.day_7_canvas
from public.week_published wp;

grant select on public.week_feed to authenticated;

-- ============================================================
-- View counts — one row per (post_user_id, year, week_number).
-- Comments — chronological flat list per published week.
-- ============================================================
create table if not exists public.week_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  week_number int not null check (week_number between 1 and 53),
  view_count bigint not null default 0,
  primary key (user_id, year, week_number)
);

alter table public.week_views enable row level security;

create policy "week_views_select_any_authenticated" on public.week_views
  for select to authenticated using (true);

-- Increment via SECURITY DEFINER RPC; no direct INSERT/UPDATE from clients.
revoke insert, update, delete on public.week_views from anon, authenticated, public;

create or replace function public.increment_week_view(
  target_user uuid, target_year int, target_week int
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if auth.uid() is null then
    raise exception 'must be signed in';
  end if;
  -- Authors do not count themselves.
  if auth.uid() = target_user then
    return;
  end if;
  -- Only count if the viewer can actually see the row (RLS-equivalent gate).
  if not exists (
    select 1 from public.week_published
    where user_id = target_user and year = target_year and week_number = target_week
      and (
        exists (select 1 from public.follows where follower_id = auth.uid() and followed_id = target_user)
        or exists (select 1 from public.profiles p where p.id = target_user and p.is_private = false)
      )
  ) then
    return;
  end if;
  insert into public.week_views (user_id, year, week_number, view_count)
  values (target_user, target_year, target_week, 1)
  on conflict (user_id, year, week_number)
  do update set view_count = public.week_views.view_count + 1;
end;
$$;

grant execute on function public.increment_week_view(uuid, int, int) to authenticated;

-- Comments
create table if not exists public.week_comments (
  id uuid primary key default gen_random_uuid(),
  post_user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  week_number int not null check (week_number between 1 and 53),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists week_comments_post_idx
  on public.week_comments (post_user_id, year, week_number, created_at);

alter table public.week_comments enable row level security;

-- A comment is visible to anyone who can see the underlying post.
create policy "week_comments_select_visible" on public.week_comments
  for select using (
    auth.uid() = post_user_id
    or auth.uid() = author_id
    or exists (select 1 from public.follows where follower_id = auth.uid() and followed_id = post_user_id)
    or exists (select 1 from public.profiles p where p.id = post_user_id and p.is_private = false)
  );

create policy "week_comments_insert_visible" on public.week_comments
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.week_published wp
      where wp.user_id = post_user_id
        and wp.year = year
        and wp.week_number = week_number
        and (
          auth.uid() = wp.user_id
          or exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.followed_id = wp.user_id)
          or exists (select 1 from public.profiles p where p.id = wp.user_id and p.is_private = false)
        )
    )
  );

create policy "week_comments_delete_own" on public.week_comments
  for delete using (auth.uid() = author_id or auth.uid() = post_user_id);
