import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAutoSavedField } from '@/hooks/useAutoSavedField';
import { DayIndex, storageKey, weekTitleKey } from '@/lib/date';
import { Community, Friend, LogPost, Nalog, NalogPost, PublishMode } from './types';
import {
  seedCommunities,
  seedCommunityPosts,
  seedFriendNalogs,
  seedFriends,
} from './seed';

const MY_COMMUNITIES_KEY = 'nalog_communities_mine';
const communityDetailKey = (id: string) => `nalog_community_${id}`;

export const PUBLISH_MODE_KEY = 'profile_publish_mode';
export const NALOG_PUB_INDEX_KEY = 'nalog_pub_index';
export const LOG_PUB_INDEX_KEY = 'log_pub_index';
export const nalogPubKey = (week: number) => `nalog_pub_w${week}`;
export const logPubKey = (id: string) => `log_pub_${id}`;

export function useMyProfile() {
  const name = useAutoSavedField('nalog_profile_name');
  const bio = useAutoSavedField('nalog_profile_bio');
  return {
    name: name.value,
    bio: bio.value,
    hydrated: name.hydrated && bio.hydrated,
    onChangeName: name.onChange,
    onChangeBio: bio.onChange,
    saveState: name.saveState === 'saving' || bio.saveState === 'saving' ? 'saving' : 'idle',
  } as const;
}

export function profileInitials(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'YO';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function readMyCommunityIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(MY_COMMUNITIES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function writeMyCommunityIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(MY_COMMUNITIES_KEY, JSON.stringify(ids));
}

async function readCommunityDetail(id: string): Promise<Community | null> {
  const raw = await AsyncStorage.getItem(communityDetailKey(id));
  if (raw) {
    try {
      return JSON.parse(raw) as Community;
    } catch {
      // fall through to seed
    }
  }
  return seedCommunities.find((c) => c.id === id) ?? null;
}

async function writeCommunityDetail(c: Community): Promise<void> {
  await AsyncStorage.setItem(communityDetailKey(c.id), JSON.stringify(c));
}

function uid(prefix = 'c'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useMyCommunities() {
  const [joined, setJoined] = useState<Community[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const ids = await readMyCommunityIds();
    const details = await Promise.all(ids.map(readCommunityDetail));
    setJoined(details.filter((d): d is Community => d != null));
  }, []);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  const join = useCallback(
    async (id: string) => {
      const ids = await readMyCommunityIds();
      if (ids.includes(id)) return;
      const seed = seedCommunities.find((c) => c.id === id);
      if (seed && !(await AsyncStorage.getItem(communityDetailKey(id)))) {
        await writeCommunityDetail(seed);
      }
      await writeMyCommunityIds([...ids, id]);
      await refresh();
    },
    [refresh],
  );

  const leave = useCallback(
    async (id: string) => {
      const ids = await readMyCommunityIds();
      await writeMyCommunityIds(ids.filter((x) => x !== id));
      await refresh();
    },
    [refresh],
  );

  const create = useCallback(
    async (name: string, tag: string): Promise<Community> => {
      const trimmedName = name.trim();
      const trimmedTag = tag.trim();
      const community: Community = {
        id: uid(),
        name: trimmedName || 'Untitled community',
        tag: trimmedTag || 'general',
        memberCount: 1,
        blurb: 'You started this one.',
      };
      await writeCommunityDetail(community);
      const ids = await readMyCommunityIds();
      await writeMyCommunityIds([community.id, ...ids]);
      await refresh();
      return community;
    },
    [refresh],
  );

  return { joined, hydrated, join, leave, create, refresh } as const;
}

// All discoverable communities = seed + any user-created (joined ones), de-duped.
export function useDiscoverCommunities(joined: Community[]): Community[] {
  const joinedIds = new Set(joined.map((c) => c.id));
  return seedCommunities.filter((c) => !joinedIds.has(c.id));
}

export function getCommunityPosts(communityId: string): Nalog[] {
  return seedCommunityPosts[communityId] ?? [];
}

// Past-weeks browser: scan AsyncStorage for nalog_w*_d*_body and group by week.
export type PastWeek = {
  week: number;
  daysWritten: number;
  title: string;
};

export function usePastWeeks() {
  const [weeks, setWeeks] = useState<PastWeek[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const keys = await AsyncStorage.getAllKeys();
    const bodyKeys = keys.filter((k) => /^nalog_w\d+_d[1-7]_body$/.test(k));
    const bodyValues = await AsyncStorage.multiGet(bodyKeys);

    const dayCount: Record<number, number> = {};
    for (const [k, v] of bodyValues) {
      if (!v) continue;
      const m = k.match(/^nalog_w(\d+)_d/);
      if (!m) continue;
      const w = parseInt(m[1], 10);
      dayCount[w] = (dayCount[w] ?? 0) + 1;
    }

    const weekNums = Object.keys(dayCount).map(Number).sort((a, b) => b - a);
    const titleEntries = await AsyncStorage.multiGet(weekNums.map((w) => `nalog_w${w}_title`));
    const titleMap = new Map(titleEntries.map(([k, v]) => [k, v ?? '']));

    setWeeks(
      weekNums.map((w) => ({
        week: w,
        daysWritten: dayCount[w],
        title: titleMap.get(`nalog_w${w}_title`) ?? '',
      })),
    );
  }, []);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  return { weeks, hydrated, refresh } as const;
}

// ───────────────────────────────────────────────────────────────────────────────
// Publish mode preference

export function usePublishMode() {
  const [mode, setModeState] = useState<PublishMode>('auto');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(PUBLISH_MODE_KEY).then((v) => {
      if (cancelled) return;
      if (v === 'manual' || v === 'auto') setModeState(v);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback(async (next: PublishMode) => {
    setModeState(next);
    await AsyncStorage.setItem(PUBLISH_MODE_KEY, next);
  }, []);

  return { mode, setMode, hydrated } as const;
}

// ───────────────────────────────────────────────────────────────────────────────
// Published Nalogs (the timeline ones)

async function readPublishedIndex(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(NALOG_PUB_INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

async function writePublishedIndex(weeks: number[]): Promise<void> {
  await AsyncStorage.setItem(NALOG_PUB_INDEX_KEY, JSON.stringify(weeks));
}

export async function readPublishedNalog(week: number): Promise<NalogPost | null> {
  const raw = await AsyncStorage.getItem(nalogPubKey(week));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NalogPost;
  } catch {
    return null;
  }
}

export function usePublishedNalogs() {
  const [posts, setPosts] = useState<NalogPost[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const weeks = await readPublishedIndex();
    const entries = await Promise.all(weeks.map(readPublishedNalog));
    setPosts(entries.filter((p): p is NalogPost => p != null));
  }, []);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  return { posts, hydrated, refresh } as const;
}

// Streak = number of consecutive published weeks ending at the most recent
// published week that is ≤ currentWeek. Ignores year boundaries (single-year scope).
export function computeStreak(publishedWeeks: number[], currentWeek: number): number {
  const set = new Set(publishedWeeks);
  let cursor = set.has(currentWeek) ? currentWeek : currentWeek - 1;
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

// Publish the given week: read its draft fields, build a NalogPost for each
// written day, and store one canonical record at nalogPubKey(week). The current
// scheme stores a single representative post per published week (the latest
// written day) — sufficient for the home tile and feed surfaces.
export async function publishWeek(
  week: number,
  author: { id: string; name: string; initials: string },
): Promise<NalogPost | null> {
  const titleRaw = await AsyncStorage.getItem(weekTitleKey(week));
  const days: DayIndex[] = [1, 2, 3, 4, 5, 6, 7];
  const reads = await Promise.all(
    days.map(async (d) => {
      const [sub, body] = await Promise.all([
        AsyncStorage.getItem(storageKey(week, d, 'subtitle')),
        AsyncStorage.getItem(storageKey(week, d, 'body')),
      ]);
      return { day: d, subtitle: sub ?? '', body: body ?? '' };
    }),
  );

  const writtenDays = reads.filter((r) => r.body.trim() || r.subtitle.trim());
  if (writtenDays.length === 0) return null;

  const latest = writtenDays[writtenDays.length - 1];
  const now = Date.now();
  const post: NalogPost = {
    kind: 'nalog',
    id: `np-${week}-${now.toString(36)}`,
    authorId: author.id,
    authorName: author.name,
    authorInitials: author.initials,
    status: 'published',
    createdAt: now,
    publishedAt: now,
    week,
    day: latest.day,
    subtitle: latest.subtitle || (titleRaw ?? ''),
    body: latest.body,
  };

  await AsyncStorage.setItem(nalogPubKey(week), JSON.stringify(post));
  const index = await readPublishedIndex();
  if (!index.includes(week)) {
    const next = [week, ...index].sort((a, b) => b - a);
    await writePublishedIndex(next);
  }
  return post;
}

// ───────────────────────────────────────────────────────────────────────────────
// Logs (blog-style posts)

async function readLogIndex(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(LOG_PUB_INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

async function writeLogIndex(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(LOG_PUB_INDEX_KEY, JSON.stringify(ids));
}

async function readLog(id: string): Promise<LogPost | null> {
  const raw = await AsyncStorage.getItem(logPubKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LogPost;
  } catch {
    return null;
  }
}

export async function createLog(
  title: string,
  body: string,
  author: { id: string; name: string; initials: string },
): Promise<LogPost> {
  const now = Date.now();
  const id = `lp-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const post: LogPost = {
    kind: 'log',
    id,
    authorId: author.id,
    authorName: author.name,
    authorInitials: author.initials,
    status: 'published',
    createdAt: now,
    publishedAt: now,
    title: title.trim(),
    body: body.trim(),
  };
  await AsyncStorage.setItem(logPubKey(id), JSON.stringify(post));
  const index = await readLogIndex();
  await writeLogIndex([id, ...index]);
  return post;
}

export function usePublishedLogs() {
  const [posts, setPosts] = useState<LogPost[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const ids = await readLogIndex();
    const entries = await Promise.all(ids.map(readLog));
    const sorted = entries
      .filter((p): p is LogPost => p != null)
      .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt));
    setPosts(sorted);
  }, []);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  return { posts, hydrated, refresh } as const;
}

// Convenience: live streak (re-derived whenever published changes).
export function useStreak(currentWeek: number): { streak: number; hydrated: boolean } {
  const { posts, hydrated } = usePublishedNalogs();
  const streak = useMemo(
    () => computeStreak(posts.map((p) => p.week), currentWeek),
    [posts, currentWeek],
  );
  return { streak, hydrated };
}

// ───────────────────────────────────────────────────────────────────────────────
// Followed users (seed-only for now; no follow toggle yet).

export type FollowedUser = { user: Friend; posts: NalogPost[] };

function postTime(p: NalogPost): number {
  return p.publishedAt ?? p.createdAt;
}

export function useFollowedUsersWithPosts(): FollowedUser[] {
  return useMemo(() => {
    const byAuthor = new Map<string, NalogPost[]>();
    for (const p of seedFriendNalogs) {
      const list = byAuthor.get(p.authorId) ?? [];
      list.push(p);
      byAuthor.set(p.authorId, list);
    }
    for (const list of byAuthor.values()) {
      list.sort((a, b) => postTime(b) - postTime(a));
    }

    const followed: FollowedUser[] = seedFriends.map((user) => ({
      user,
      posts: byAuthor.get(user.id) ?? [],
    }));

    followed.sort((a, b) => {
      const ta = a.posts[0] ? postTime(a.posts[0]) : 0;
      const tb = b.posts[0] ? postTime(b.posts[0]) : 0;
      return tb - ta;
    });
    return followed;
  }, []);
}

export function findFollowedUser(id: string): Friend | null {
  return seedFriends.find((f) => f.id === id) ?? null;
}

export function findFriendPost(id: string): NalogPost | null {
  return seedFriendNalogs.find((p) => p.id === id) ?? null;
}

export function getPostsByAuthor(authorId: string): NalogPost[] {
  return seedFriendNalogs
    .filter((p) => p.authorId === authorId)
    .sort((a, b) => postTime(b) - postTime(a));
}
