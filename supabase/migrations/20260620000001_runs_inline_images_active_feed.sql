-- Phase 6: character-range private runs, inline image blocks, per-day metrics
-- and habit-checks, week-level habits, and the rolling 7-day "active" feed
-- view (latest-week-per-author, 7-day cutoff).
--
-- Strategy: additive on tables; replace the redact_blocks() function and the
-- week_feed view. Old `day_X_canvas` columns are kept (now expected to be
-- empty for new writes) so the column shape stays compatible.

-- ============================================================
-- 1. Per-day & per-week JSONB columns for metrics, habit checks, habits.
-- ============================================================
alter table public.week_drafts
  add column if not exists week_habits jsonb not null default '[]'::jsonb,
  add column if not exists day_1_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_2_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_3_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_4_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_5_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_6_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_7_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_1_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_2_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_3_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_4_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_5_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_6_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_7_habit_checks jsonb not null default '{}'::jsonb;

alter table public.week_published
  add column if not exists week_habits jsonb not null default '[]'::jsonb,
  add column if not exists day_1_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_2_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_3_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_4_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_5_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_6_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_7_metrics jsonb not null default '[]'::jsonb,
  add column if not exists day_1_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_2_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_3_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_4_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_5_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_6_habit_checks jsonb not null default '{}'::jsonb,
  add column if not exists day_7_habit_checks jsonb not null default '{}'::jsonb;

-- Loose size guards on the new payloads.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'wp_metrics_size'
  ) then
    alter table public.week_published
      add constraint wp_metrics_size check (
        jsonb_array_length(day_1_metrics) <= 50 and
        jsonb_array_length(day_2_metrics) <= 50 and
        jsonb_array_length(day_3_metrics) <= 50 and
        jsonb_array_length(day_4_metrics) <= 50 and
        jsonb_array_length(day_5_metrics) <= 50 and
        jsonb_array_length(day_6_metrics) <= 50 and
        jsonb_array_length(day_7_metrics) <= 50
      );
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'wd_metrics_size'
  ) then
    alter table public.week_drafts
      add constraint wd_metrics_size check (
        jsonb_array_length(day_1_metrics) <= 50 and
        jsonb_array_length(day_2_metrics) <= 50 and
        jsonb_array_length(day_3_metrics) <= 50 and
        jsonb_array_length(day_4_metrics) <= 50 and
        jsonb_array_length(day_5_metrics) <= 50 and
        jsonb_array_length(day_6_metrics) <= 50 and
        jsonb_array_length(day_7_metrics) <= 50
      );
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'wp_habits_size'
  ) then
    alter table public.week_published
      add constraint wp_habits_size check (jsonb_array_length(week_habits) <= 20);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'wd_habits_size'
  ) then
    alter table public.week_drafts
      add constraint wd_habits_size check (jsonb_array_length(week_habits) <= 20);
  end if;
end$$;

-- ============================================================
-- 2. Runs-aware redaction helpers.
--
-- For non-followers, redact_blocks() concatenates only the text slices that
-- lie OUTSIDE any private run, drops the `runs` field, and sets
-- `redacted: true`. Heading and image blocks pass through unchanged.
-- ============================================================
create or replace function public.redact_text(t text, runs jsonb)
returns text
language plpgsql
immutable
as $$
declare
  res text := '';
  cur int := 0;
  rec record;
  tlen int := char_length(coalesce(t, ''));
begin
  if tlen = 0 then return ''; end if;
  if runs is null or jsonb_typeof(runs) <> 'array' or jsonb_array_length(runs) = 0 then
    return t;
  end if;
  for rec in
    select
      greatest(0, least(tlen, coalesce((e->>'start')::int, 0))) as s,
      greatest(0, least(tlen, coalesce((e->>'end')::int, 0))) as e_end
    from jsonb_array_elements(runs) e
    order by coalesce((e->>'start')::int, 0)
  loop
    if rec.s > cur then
      res := res || substring(t from cur + 1 for rec.s - cur);
    end if;
    if rec.e_end > cur then
      cur := rec.e_end;
    end if;
  end loop;
  if cur < tlen then
    res := res || substring(t from cur + 1);
  end if;
  return res;
end;
$$;

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
          when (b->>'type') = 'text' then
            case
              -- Legacy block-level private flag → omit text entirely.
              when (b->>'private')::boolean is true then
                jsonb_build_object(
                  'id', b->'id',
                  'type', 'text',
                  'text', '',
                  'redacted', true
                )
              when b ? 'runs'
                and jsonb_typeof(b->'runs') = 'array'
                and jsonb_array_length(b->'runs') > 0 then
                jsonb_build_object(
                  'id', b->'id',
                  'type', 'text',
                  'text', public.redact_text(b->>'text', b->'runs'),
                  'redacted', true
                )
              else (b - 'runs') - 'private'
            end
          -- Heading / image blocks pass through (image-level privacy is a
          -- follow-up; image rows are visible if the row itself is visible).
          else b
        end
      ), '[]'::jsonb)
      from jsonb_array_elements(blocks) b
    )
  end
$$;

-- ============================================================
-- 3. week_feed_active view: 7-day cutoff + latest-week-per-author.
--    Old week_feed view becomes a thin alias for one release.
-- ============================================================
drop view if exists public.week_feed;
drop view if exists public.week_feed_active;

create view public.week_feed_active
with (security_invoker = true)
as
select
  wp.user_id,
  wp.year,
  wp.week_number,
  wp.title,
  wp.published_at,
  wp.week_habits,
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
  wp.day_5_canvas, wp.day_6_canvas, wp.day_7_canvas,
  wp.day_1_metrics, wp.day_2_metrics, wp.day_3_metrics, wp.day_4_metrics,
  wp.day_5_metrics, wp.day_6_metrics, wp.day_7_metrics,
  wp.day_1_habit_checks, wp.day_2_habit_checks, wp.day_3_habit_checks, wp.day_4_habit_checks,
  wp.day_5_habit_checks, wp.day_6_habit_checks, wp.day_7_habit_checks
from public.week_published wp
where wp.published_at > now() - interval '7 days'
  and not exists (
    select 1 from public.week_published wp2
    where wp2.user_id = wp.user_id
      and (wp2.year, wp2.week_number) > (wp.year, wp.week_number)
  );

grant select on public.week_feed_active to authenticated;

-- One-release alias so older clients that still hit week_feed keep working.
create view public.week_feed
with (security_invoker = true)
as select * from public.week_feed_active;

grant select on public.week_feed to authenticated;

-- ============================================================
-- 4. Idempotent backfill of existing rows:
--    - Lift any text block with `private: true` into `runs: [{start:0, end:len(text)}]`
--      and drop the `private` flag.
--    - Append legacy day_N_canvas items as inline image blocks if the day's
--      blocks array has no image yet.
--
-- Both translations are no-ops once applied, so re-running the migration is
-- safe.
-- ============================================================
create or replace function public._nalog_migrate_blocks(blocks jsonb, canvas jsonb, fallback_image_path text)
returns jsonb
language plpgsql
immutable
as $$
declare
  out_arr jsonb := '[]'::jsonb;
  rec jsonb;
  txt text;
  ratio numeric;
begin
  if blocks is null or jsonb_typeof(blocks) <> 'array' then
    out_arr := '[]'::jsonb;
  else
    for rec in select b from jsonb_array_elements(blocks) b loop
      if (rec->>'type') = 'text' and (rec->>'private')::boolean is true then
        txt := coalesce(rec->>'text', '');
        out_arr := out_arr || jsonb_build_array(jsonb_build_object(
          'id', rec->'id',
          'type', 'text',
          'text', txt,
          'runs', jsonb_build_array(jsonb_build_object('start', 0, 'end', char_length(txt)))
        ));
      else
        out_arr := out_arr || jsonb_build_array(rec - 'private');
      end if;
    end loop;
  end if;

  -- Has any image block already?
  if exists (
    select 1 from jsonb_array_elements(out_arr) b where (b->>'type') = 'image'
  ) then
    return out_arr;
  end if;

  if canvas is not null and jsonb_typeof(canvas) = 'array' and jsonb_array_length(canvas) > 0 then
    for rec in select c from jsonb_array_elements(canvas) c loop
      ratio := coalesce((rec->>'ratio')::numeric, 4.0/3.0);
      out_arr := out_arr || jsonb_build_array(jsonb_build_object(
        'id', 'b-mig-' || (rec->>'id'),
        'type', 'image',
        'path', rec->>'path',
        'ratio', ratio,
        'caption', ''
      ));
    end loop;
  elsif fallback_image_path is not null and fallback_image_path <> '' then
    out_arr := out_arr || jsonb_build_array(jsonb_build_object(
      'id', 'b-mig-legacy',
      'type', 'image',
      'path', fallback_image_path,
      'ratio', 4.0/3.0,
      'caption', ''
    ));
  end if;

  return out_arr;
end;
$$;

-- Apply to week_published.
update public.week_published wp
set
  day_1_blocks = public._nalog_migrate_blocks(wp.day_1_blocks, wp.day_1_canvas, wp.day_1_image_path),
  day_2_blocks = public._nalog_migrate_blocks(wp.day_2_blocks, wp.day_2_canvas, wp.day_2_image_path),
  day_3_blocks = public._nalog_migrate_blocks(wp.day_3_blocks, wp.day_3_canvas, wp.day_3_image_path),
  day_4_blocks = public._nalog_migrate_blocks(wp.day_4_blocks, wp.day_4_canvas, wp.day_4_image_path),
  day_5_blocks = public._nalog_migrate_blocks(wp.day_5_blocks, wp.day_5_canvas, wp.day_5_image_path),
  day_6_blocks = public._nalog_migrate_blocks(wp.day_6_blocks, wp.day_6_canvas, wp.day_6_image_path),
  day_7_blocks = public._nalog_migrate_blocks(wp.day_7_blocks, wp.day_7_canvas, wp.day_7_image_path);

update public.week_drafts wd
set
  day_1_blocks = public._nalog_migrate_blocks(wd.day_1_blocks, wd.day_1_canvas, wd.day_1_image_path),
  day_2_blocks = public._nalog_migrate_blocks(wd.day_2_blocks, wd.day_2_canvas, wd.day_2_image_path),
  day_3_blocks = public._nalog_migrate_blocks(wd.day_3_blocks, wd.day_3_canvas, wd.day_3_image_path),
  day_4_blocks = public._nalog_migrate_blocks(wd.day_4_blocks, wd.day_4_canvas, wd.day_4_image_path),
  day_5_blocks = public._nalog_migrate_blocks(wd.day_5_blocks, wd.day_5_canvas, wd.day_5_image_path),
  day_6_blocks = public._nalog_migrate_blocks(wd.day_6_blocks, wd.day_6_canvas, wd.day_6_image_path),
  day_7_blocks = public._nalog_migrate_blocks(wd.day_7_blocks, wd.day_7_canvas, wd.day_7_image_path);

drop function public._nalog_migrate_blocks(jsonb, jsonb, text);
