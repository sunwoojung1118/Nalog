import { supabase } from './supabase';

export type Profile = {
  id: string;
  display_name: string;
  bio: string;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .order('display_name');
  if (error) throw error;
  return data ?? [];
}

export async function updateProfile(userId: string, display_name: string, bio: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name, bio })
    .eq('id', userId);
  if (error) throw error;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
