import { supabase } from './supabase';

export async function follow(followerId: string, targetId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, followed_id: targetId });
  if (error && error.code !== '23505') throw error; // 23505 = unique violation (already following)
}

export async function unfollow(followerId: string, targetId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followed_id', targetId);
  if (error) throw error;
}

export async function fetchFollowingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('followed_id')
    .eq('follower_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.followed_id);
}

export async function fetchFollowerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', userId);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);
  if (error) return 0;
  return count ?? 0;
}
