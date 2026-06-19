import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { GlassView } from '@/components/GlassView';
import { NalogCard } from '@/components/NalogCard';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { FeedPost, fetchUserPosts } from '@/lib/feedApi';
import { follow, fetchFollowingIds, unfollow } from '@/lib/followApi';
import { fetchAllProfiles, initials, Profile } from '@/lib/profileApi';

const CATEGORIES = ['All', 'This Week', 'Life', 'Work', 'Travel', 'Reflection'] as const;
type Category = (typeof CATEGORIES)[number];

const APP_BAR_HEIGHT = 60;

export default function CommunityScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [trending, setTrending] = useState<FeedPost[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  const [recent, setRecent] = useState<FeedPost[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const [allProfiles, followIds] = await Promise.all([
        fetchAllProfiles(),
        fetchFollowingIds(session.user.id),
      ]);
      setFollowingIds(followIds);

      // People to follow = not self, not already following
      const others = allProfiles.filter(
        (p) => p.id !== session.user.id && !followIds.includes(p.id),
      );
      setPeople(others);

      // Gather recent posts from a few followed + others
      const feedIds = followIds.length > 0 ? followIds : allProfiles.slice(0, 5).map((p) => p.id);
      const recentPosts: FeedPost[] = [];
      await Promise.all(
        feedIds.slice(0, 8).map(async (uid) => {
          const posts = await fetchUserPosts(uid);
          const profile = allProfiles.find((p) => p.id === uid) ?? null;
          posts.slice(0, 2).forEach((w) => {
            recentPosts.push({
              id: `${w.user_id}-${w.year}-${w.week_number}`,
              user_id: w.user_id,
              year: w.year,
              week_number: w.week_number,
              title: w.title,
              body: w.body,
              published_at: w.published_at,
              profile: profile ? { display_name: profile.display_name, bio: profile.bio } : null,
            });
          });
        }),
      );
      recentPosts.sort((a, b) => b.published_at.localeCompare(a.published_at));
      setTrending(recentPosts.slice(0, 6));
      setRecent(recentPosts);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const handleToggleFollow = useCallback(
    async (targetId: string) => {
      if (!session) return;
      const isFollowing = followingIds.includes(targetId);
      if (isFollowing) {
        setFollowingIds((ids) => ids.filter((id) => id !== targetId));
        await unfollow(session.user.id, targetId);
      } else {
        setFollowingIds((ids) => [...ids, targetId]);
        await follow(session.user.id, targetId);
      }
    },
    [session, followingIds],
  );

  const filteredRecent = recent.filter((p) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'This Week') {
      const weekAgo = Date.now() - 7 * 86400000;
      return new Date(p.published_at).getTime() > weekAgo;
    }
    const kw = activeCategory.toLowerCase();
    return (p.title + p.body).toLowerCase().includes(kw);
  });

  const topPad = insets.top + APP_BAR_HEIGHT;

  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Glass app bar */}
      <GlassView
        variant="elevated"
        style={[styles.appBar, { paddingTop: insets.top, height: insets.top + APP_BAR_HEIGHT }]}
        borderRadius={0}
      >
        <View style={styles.appBarInner}>
          <Text style={styles.appBarTitle}>Discover</Text>
        </View>
      </GlassView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Trending section */}
        {trending.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending This Week</Text>
              <Text style={styles.seeAll}>See all</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {trending.map((item) => (
                <NalogCard
                  key={item.id}
                  userId={item.user_id}
                  displayName={item.profile?.display_name ?? 'Someone'}
                  weekNumber={item.week_number}
                  year={item.year}
                  title={item.title}
                  body={item.body}
                  publishedAt={item.published_at}
                  compact
                  onPress={() =>
                    router.push({
                      pathname: '/n/[id]',
                      params: {
                        id: item.id,
                        userId: item.user_id,
                        year: item.year,
                        week: item.week_number,
                      },
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* People to follow */}
        {people.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>People to Follow</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {people.map((person) => (
                <PersonPill
                  key={person.id}
                  profile={person}
                  isFollowing={followingIds.includes(person.id)}
                  onToggleFollow={() => handleToggleFollow(person.id)}
                  onPress={() => router.push({ pathname: '/u/[id]', params: { id: person.id } })}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Recent journals vertical list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Journals</Text>
          </View>
          {filteredRecent.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No journals yet. Follow people to see their weeks.</Text>
            </View>
          ) : (
            <View style={styles.verticalList}>
              {filteredRecent.map((item) => (
                <NalogCard
                  key={item.id}
                  userId={item.user_id}
                  displayName={item.profile?.display_name ?? 'Someone'}
                  weekNumber={item.week_number}
                  year={item.year}
                  title={item.title}
                  body={item.body}
                  publishedAt={item.published_at}
                  onPress={() =>
                    router.push({
                      pathname: '/n/[id]',
                      params: {
                        id: item.id,
                        userId: item.user_id,
                        year: item.year,
                        week: item.week_number,
                      },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function PersonPill({
  profile,
  isFollowing,
  onToggleFollow,
  onPress,
}: {
  profile: Profile;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.personPill}>
      <GlassView variant="base" style={styles.personCard} borderRadius={radius.tile}>
        <Avatar initials={initials(profile.display_name)} size={48} />
        <Text style={styles.personName} numberOfLines={1}>
          {profile.display_name || 'Someone'}
        </Text>
        {profile.bio ? (
          <Text style={styles.personBio} numberOfLines={2}>{profile.bio}</Text>
        ) : null}
        <Pressable
          onPress={onToggleFollow}
          style={[styles.followBtn, isFollowing && styles.followBtnActive]}
        >
          <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loader: { flex: 1, alignSelf: 'center' },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  appBarInner: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  appBarTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  chipsScroll: { flexGrow: 0 },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSurface,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontFamily: fonts.rounded,
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontFamily: fonts.rounded,
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  horizontalList: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  verticalList: {
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  emptySection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
  },
  personPill: {},
  personCard: {
    width: 140,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  personName: {
    fontFamily: fonts.rounded,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  personBio: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 16,
  },
  followBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  followBtnActive: {
    backgroundColor: colors.accent,
  },
  followText: {
    fontFamily: fonts.rounded,
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  followTextActive: {
    color: '#FFFFFF',
  },
});
