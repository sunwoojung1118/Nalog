import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { NalogCard } from '@/components/NalogCard';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { follow, fetchFollowingIds, fetchFollowerCount, fetchFollowingCount, unfollow } from '@/lib/followApi';
import { fetchUserPosts, PublishedWeek } from '@/lib/feedApi';
import { fetchProfile, initials, Profile } from '@/lib/profileApi';

function coverGradientForUser(userId: string): readonly [string, string] {
  const idx = (userId.charCodeAt(0) || 0) % colors.coverGradients.length;
  return colors.coverGradients[idx];
}

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weeks, setWeeks] = useState<PublishedWeek[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isSelf = session?.user.id === id;

  useEffect(() => {
    if (!id) return;
    fetchProfile(id).then(setProfile);
    fetchUserPosts(id).then(setWeeks);
    fetchFollowerCount(id).then(setFollowerCount);
    fetchFollowingCount(id).then(setFollowingCount);
    if (session && !isSelf) {
      fetchFollowingIds(session.user.id).then((ids) => setIsFollowing(ids.includes(id)));
    }
  }, [id, session, isSelf]);

  const handleToggleFollow = useCallback(async () => {
    if (!session || !id) return;
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowerCount((c) => c + (next ? 1 : -1));
    if (next) {
      await follow(session.user.id, id);
    } else {
      await unfollow(session.user.id, id);
    }
  }, [session, id, isFollowing]);

  const name = profile?.display_name ?? '';
  const [gradStart, gradEnd] = id ? coverGradientForUser(id) : colors.coverGradients[1];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero cover */}
      <LinearGradient
        colors={[gradStart, gradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cover, { paddingTop: insets.top }]}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>

        {/* Decorative dots */}
        <View style={styles.coverDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.coverDot, i === 0 && styles.coverDotActive]} />
          ))}
        </View>
      </LinearGradient>

      {/* Avatar overlapping cover */}
      <View style={styles.avatarWrap}>
        <Avatar initials={initials(name)} size={80} borderColor="#FFFFFF" />
      </View>

      {/* Profile info */}
      <View style={styles.profileInfo}>
        <Text style={styles.name}>{name || 'Someone'}</Text>
        {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{weeks.length}</Text>
          <Text style={styles.statLabel}>published</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{followerCount}</Text>
          <Text style={styles.statLabel}>followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{followingCount}</Text>
          <Text style={styles.statLabel}>following</Text>
        </View>
      </View>

      {/* Follow button */}
      {!isSelf ? (
        <View style={styles.actions}>
          <Pressable
            onPress={handleToggleFollow}
            style={[styles.followBtn, isFollowing && styles.followBtnActive]}
          >
            <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
              {isFollowing ? '✓ Following' : 'Follow'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Journals section */}
      <View style={styles.journalsSection}>
        <Text style={styles.sectionTitle}>
          {isSelf ? 'Your Journals' : `${name.split(' ')[0] || 'Their'}'s Journals`}
        </Text>
        {weeks.length === 0 ? (
          <Text style={styles.emptyText}>Nothing published yet.</Text>
        ) : (
          <View style={styles.journalsList}>
            {weeks.map((item) => (
              <NalogCard
                key={`${item.year}-${item.week_number}`}
                userId={item.user_id}
                displayName={name}
                weekNumber={item.week_number}
                year={item.year}
                title={item.title}
                body={item.body}
                publishedAt={item.published_at}
                onPress={() =>
                  router.push({
                    pathname: '/n/[id]',
                    params: {
                      id: `${item.user_id}-${item.year}-${item.week_number}`,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {},
  cover: {
    height: 220,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.20)',
    marginTop: spacing.sm,
  },
  backBtnText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  coverDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'center',
  },
  coverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
  coverDotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginTop: -40,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  bio: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textSoft,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.tile,
    backgroundColor: colors.bgDeep,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.rounded,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.rounded,
    fontSize: 11,
    color: colors.textFaint,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
  actions: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  followBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  followBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  followText: {
    fontFamily: fonts.rounded,
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
  followTextActive: { color: '#FFFFFF' },
  journalsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  journalsList: {
    gap: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
