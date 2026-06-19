-- Phase 4: security hardening.
--   * Privatize post-images bucket; auth + follower-gated reads
--   * Mime allowlist + size cap on the bucket
--   * Server-side prefix check on every image_path column
--   * Length caps on every user-controlled text column
--   * Harden touch_updated_at() search_path

-- ============================================================
-- Storage: make post-images private, restrict reads to author or follower
-- ============================================================
update storage.buckets
set
  public = false,
  file_size_limit = 5 * 1024 * 1024,                       -- 5 MB
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
where id = 'post-images';

drop policy if exists "post_images_select_public" on storage.objects;

create policy "post_images_select_visible" on storage.objects
  for select to authenticated using (
    bucket_id = 'post-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.follows f
        where f.follower_id = auth.uid()
          and f.followed_id::text = (storage.foldername(name))[1]
      )
    )
  );

-- ============================================================
-- Image path prefix enforcement on row-level columns.
--   Every *_image_path text must begin with "<user_id>/" so the row
--   cannot reference another author's storage object.
-- ============================================================
alter table public.week_drafts
  add constraint week_drafts_image_paths_user_prefix check (
    (day_1_image_path is null or day_1_image_path like user_id::text || '/%') and
    (day_2_image_path is null or day_2_image_path like user_id::text || '/%') and
    (day_3_image_path is null or day_3_image_path like user_id::text || '/%') and
    (day_4_image_path is null or day_4_image_path like user_id::text || '/%') and
    (day_5_image_path is null or day_5_image_path like user_id::text || '/%') and
    (day_6_image_path is null or day_6_image_path like user_id::text || '/%') and
    (day_7_image_path is null or day_7_image_path like user_id::text || '/%')
  );

alter table public.week_published
  add constraint week_published_image_paths_user_prefix check (
    (day_1_image_path is null or day_1_image_path like user_id::text || '/%') and
    (day_2_image_path is null or day_2_image_path like user_id::text || '/%') and
    (day_3_image_path is null or day_3_image_path like user_id::text || '/%') and
    (day_4_image_path is null or day_4_image_path like user_id::text || '/%') and
    (day_5_image_path is null or day_5_image_path like user_id::text || '/%') and
    (day_6_image_path is null or day_6_image_path like user_id::text || '/%') and
    (day_7_image_path is null or day_7_image_path like user_id::text || '/%')
  );

alter table public.log_posts
  add constraint log_posts_image_path_user_prefix check (
    image_path is null or image_path like user_id::text || '/%'
  );

-- ============================================================
-- Length caps on user-controlled text. Caps are deliberately generous
-- — they exist to stop abuse, not to constrain product behavior.
-- ============================================================
alter table public.profiles
  add constraint profiles_display_name_len check (char_length(display_name) <= 80),
  add constraint profiles_bio_len          check (char_length(bio)          <= 500);

alter table public.week_drafts
  add constraint wd_title_len     check (char_length(title) <= 200),
  add constraint wd_d1_st_len     check (char_length(day_1_subtitle) <= 200),
  add constraint wd_d2_st_len     check (char_length(day_2_subtitle) <= 200),
  add constraint wd_d3_st_len     check (char_length(day_3_subtitle) <= 200),
  add constraint wd_d4_st_len     check (char_length(day_4_subtitle) <= 200),
  add constraint wd_d5_st_len     check (char_length(day_5_subtitle) <= 200),
  add constraint wd_d6_st_len     check (char_length(day_6_subtitle) <= 200),
  add constraint wd_d7_st_len     check (char_length(day_7_subtitle) <= 200),
  add constraint wd_d1_body_len   check (char_length(day_1_body) <= 8000),
  add constraint wd_d2_body_len   check (char_length(day_2_body) <= 8000),
  add constraint wd_d3_body_len   check (char_length(day_3_body) <= 8000),
  add constraint wd_d4_body_len   check (char_length(day_4_body) <= 8000),
  add constraint wd_d5_body_len   check (char_length(day_5_body) <= 8000),
  add constraint wd_d6_body_len   check (char_length(day_6_body) <= 8000),
  add constraint wd_d7_body_len   check (char_length(day_7_body) <= 8000),
  add constraint wd_d1_cap_len    check (char_length(day_1_caption) <= 500),
  add constraint wd_d2_cap_len    check (char_length(day_2_caption) <= 500),
  add constraint wd_d3_cap_len    check (char_length(day_3_caption) <= 500),
  add constraint wd_d4_cap_len    check (char_length(day_4_caption) <= 500),
  add constraint wd_d5_cap_len    check (char_length(day_5_caption) <= 500),
  add constraint wd_d6_cap_len    check (char_length(day_6_caption) <= 500),
  add constraint wd_d7_cap_len    check (char_length(day_7_caption) <= 500);

alter table public.week_published
  add constraint wp_title_len     check (char_length(title) <= 200),
  add constraint wp_d1_st_len     check (char_length(day_1_subtitle) <= 200),
  add constraint wp_d2_st_len     check (char_length(day_2_subtitle) <= 200),
  add constraint wp_d3_st_len     check (char_length(day_3_subtitle) <= 200),
  add constraint wp_d4_st_len     check (char_length(day_4_subtitle) <= 200),
  add constraint wp_d5_st_len     check (char_length(day_5_subtitle) <= 200),
  add constraint wp_d6_st_len     check (char_length(day_6_subtitle) <= 200),
  add constraint wp_d7_st_len     check (char_length(day_7_subtitle) <= 200),
  add constraint wp_d1_body_len   check (char_length(day_1_body) <= 8000),
  add constraint wp_d2_body_len   check (char_length(day_2_body) <= 8000),
  add constraint wp_d3_body_len   check (char_length(day_3_body) <= 8000),
  add constraint wp_d4_body_len   check (char_length(day_4_body) <= 8000),
  add constraint wp_d5_body_len   check (char_length(day_5_body) <= 8000),
  add constraint wp_d6_body_len   check (char_length(day_6_body) <= 8000),
  add constraint wp_d7_body_len   check (char_length(day_7_body) <= 8000),
  add constraint wp_d1_cap_len    check (char_length(day_1_caption) <= 500),
  add constraint wp_d2_cap_len    check (char_length(day_2_caption) <= 500),
  add constraint wp_d3_cap_len    check (char_length(day_3_caption) <= 500),
  add constraint wp_d4_cap_len    check (char_length(day_4_caption) <= 500),
  add constraint wp_d5_cap_len    check (char_length(day_5_caption) <= 500),
  add constraint wp_d6_cap_len    check (char_length(day_6_caption) <= 500),
  add constraint wp_d7_cap_len    check (char_length(day_7_caption) <= 500);

alter table public.log_posts
  add constraint lp_title_len   check (char_length(title)   <= 200),
  add constraint lp_body_len    check (char_length(body)    <= 20000),
  add constraint lp_caption_len check (char_length(caption) <= 500);

alter table public.communities
  add constraint com_name_len  check (char_length(name)  <= 80),
  add constraint com_tag_len   check (char_length(tag)   <= 40),
  add constraint com_blurb_len check (char_length(blurb) <= 500);

-- ============================================================
-- Harden touch_updated_at(): pin search_path so a future change to
-- it (e.g. promotion to SECURITY DEFINER) cannot be hijacked.
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
