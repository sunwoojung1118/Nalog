-- Phase 3: one photo + caption per nalog day and per log post.
-- Public bucket; storage paths are scoped under each user's UUID.

-- ============================================================
-- Storage bucket for post images.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post_images_select_public" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "post_images_insert_own_folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "post_images_update_own_folder" on storage.objects
  for update to authenticated using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "post_images_delete_own_folder" on storage.objects
  for delete to authenticated using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Image + caption columns on week_drafts (14) and week_published (14).
-- Symmetric across both tables so publish is a mechanical column copy.
-- ============================================================
alter table public.week_drafts
  add column day_1_image_path text,
  add column day_1_caption text not null default '',
  add column day_2_image_path text,
  add column day_2_caption text not null default '',
  add column day_3_image_path text,
  add column day_3_caption text not null default '',
  add column day_4_image_path text,
  add column day_4_caption text not null default '',
  add column day_5_image_path text,
  add column day_5_caption text not null default '',
  add column day_6_image_path text,
  add column day_6_caption text not null default '',
  add column day_7_image_path text,
  add column day_7_caption text not null default '';

alter table public.week_published
  add column day_1_image_path text,
  add column day_1_caption text not null default '',
  add column day_2_image_path text,
  add column day_2_caption text not null default '',
  add column day_3_image_path text,
  add column day_3_caption text not null default '',
  add column day_4_image_path text,
  add column day_4_caption text not null default '',
  add column day_5_image_path text,
  add column day_5_caption text not null default '',
  add column day_6_image_path text,
  add column day_6_caption text not null default '',
  add column day_7_image_path text,
  add column day_7_caption text not null default '';

-- ============================================================
-- Image + caption on log_posts.
-- ============================================================
alter table public.log_posts
  add column image_path text,
  add column caption text not null default '';
