import { supabase } from './supabase';

export type FeedPost = {
  id: string;
  user_id: string;
  year: number;
  week_number: number;
  title: string;
  body: string;
  published_at: string;
  profile: { display_name: string; bio: string } | null;
};

export type PublishedWeek = {
  user_id: string;
  year: number;
  week_number: number;
  title: string;
  body: string;
  published_at: string;
};

async function fetchProfilesMap(userIds: string[]): Promise<Map<string, { display_name: string; bio: string }>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .in('id', userIds);
  const map = new Map<string, { display_name: string; bio: string }>();
  (data ?? []).forEach((p) => map.set(p.id, { display_name: p.display_name, bio: p.bio }));
  return map;
}

export async function fetchFeed(userId: string): Promise<FeedPost[]> {
  const { data: followRows } = await supabase
    .from('follows')
    .select('followed_id')
    .eq('follower_id', userId);

  const followedIds = (followRows ?? []).map((r) => r.followed_id);
  if (followedIds.length === 0) return [];

  const { data, error } = await supabase
    .from('week_published')
    .select('user_id, year, week_number, title, day_1_body, published_at')
    .in('user_id', followedIds)
    .order('published_at', { ascending: false })
    .limit(40);

  if (error) throw error;

  const rows = data ?? [];
  const profilesMap = await fetchProfilesMap(rows.map((r) => r.user_id));

  return rows.map((r) => {
    const row = r as typeof r & { day_1_body?: string };
    return {
      id: `${r.user_id}-${r.year}-${r.week_number}`,
      user_id: r.user_id,
      year: r.year,
      week_number: r.week_number,
      title: r.title,
      body: row.day_1_body ?? '',
      published_at: r.published_at,
      profile: profilesMap.get(r.user_id) ?? null,
    };
  });
}

export async function fetchUserPosts(userId: string): Promise<PublishedWeek[]> {
  const { data, error } = await supabase
    .from('week_published')
    .select('user_id, year, week_number, title, day_1_body, published_at')
    .eq('user_id', userId)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    user_id: r.user_id,
    year: r.year,
    week_number: r.week_number,
    title: r.title,
    body: (r as Record<string, string>).day_1_body ?? '',
    published_at: r.published_at,
  }));
}

export async function fetchPost(userId: string, year: number, weekNumber: number): Promise<FeedPost | null> {
  const { data, error } = await supabase
    .from('week_published')
    .select('user_id, year, week_number, title, day_1_body, published_at')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('week_number', weekNumber)
    .single();

  if (error || !data) return null;

  const profilesMap = await fetchProfilesMap([data.user_id]);
  const row = data as typeof data & { day_1_body?: string };

  return {
    id: `${data.user_id}-${data.year}-${data.week_number}`,
    user_id: data.user_id,
    year: data.year,
    week_number: data.week_number,
    title: data.title,
    body: row.day_1_body ?? '',
    published_at: data.published_at,
    profile: profilesMap.get(data.user_id) ?? null,
  };
}

export async function publishWeek(
  userId: string,
  year: number,
  week: number,
  title: string,
  body: string,
): Promise<void> {
  const { error } = await supabase.from('week_published').upsert(
    {
      user_id: userId,
      year,
      week_number: week,
      title,
      day_1_body: body,
      published_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,year,week_number' },
  );
  if (error) throw error;
}
