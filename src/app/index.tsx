import { Href, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmbientBackground } from '@/components/AmbientBackground';
import { DarkTabBar, TabKey } from '@/components/home/DarkTabBar';
import { DateStrip } from '@/components/home/DateStrip';
import { NalogFeedCard } from '@/components/home/NalogFeedCard';
import { ProfileHeaderPill } from '@/components/home/ProfileHeaderPill';
import { ResponsiveColumn } from '@/components/ResponsiveColumn';
import { colors, fonts, spacing } from '@/constants/theme';
import { useWeekProgress } from '@/hooks/useWeekProgress';
import { DayIndex, dayName, isoWeeksInYear } from '@/lib/date';
import { useCurrentDate } from '@/lib/useCurrentDate';
import { CommunityTab } from '@/social/tabs/CommunityTab';
import { ProfileTab } from '@/social/tabs/ProfileTab';
import {
  profileInitials,
  useFollowedUsersWithPosts,
  useMyProfile,
  usePublishedNalogs,
  useStreak,
} from '@/social/data/social-store';

const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function longDate(now: Date): string {
  return `${dayName(((now.getDay() || 7) as DayIndex))}, ${MONTH_LONG[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

export default function HomeScreen() {
  const [tab, setTab] = useState<TabKey>('home');
  const insets = useSafeAreaInsets();
  const { year, week, today } = useCurrentDate();
  const totalWeeks = useMemo(() => isoWeeksInYear(year), [year]);
  const profile = useMyProfile();
  const initials = profileInitials(profile.name);
  const { streak } = useStreak(week);
  const progress = useWeekProgress(year, week);

  // Reserved tab footprint so scroll content clears the dark tab bar.
  const tabFootprint = 96 + Math.max(spacing.sm, insets.bottom);

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <View style={[styles.body, { paddingTop: insets.top + spacing.sm }]}>
        {tab === 'home' ? (
          <HomeFeed
            name={profile.name}
            initials={initials}
            completedDays={progress}
            today={today}
            streak={streak}
            week={week}
            totalWeeks={totalWeeks}
            longDateLabel={longDate(new Date())}
            bottomPadding={tabFootprint}
          />
        ) : null}
        {tab === 'community' ? <CommunityTab contentBottomPadding={tabFootprint} /> : null}
        {tab === 'profile' ? <ProfileTab contentBottomPadding={tabFootprint} /> : null}
      </View>

      <View style={styles.tabBarHost}>
        <DarkTabBar
          active={tab}
          onChange={setTab}
          onPressCompose={() => router.push('/write' as Href)}
        />
      </View>
    </View>
  );
}

type HomeFeedProps = {
  name: string;
  initials: string;
  completedDays: ReturnType<typeof useWeekProgress>;
  today: DayIndex;
  streak: number;
  week: number;
  totalWeeks: number;
  longDateLabel: string;
  bottomPadding: number;
};

function HomeFeed({
  name,
  initials,
  completedDays,
  today,
  streak,
  week,
  totalWeeks,
  longDateLabel,
  bottomPadding,
}: HomeFeedProps) {
  const followed = useFollowedUsersWithPosts();
  const mine = usePublishedNalogs();

  // Flatten followed feeds + my own most-recent post into a single chronological list.
  const feed = useMemo(() => {
    const items = followed.flatMap(({ user, posts }) =>
      posts.map((p) => ({ post: p, bio: user.bio })),
    );
    if (mine.posts[0]) items.push({ post: mine.posts[0], bio: undefined });
    items.sort(
      (a, b) =>
        (b.post.publishedAt ?? b.post.createdAt) -
        (a.post.publishedAt ?? a.post.createdAt),
    );
    return items;
  }, [followed, mine.posts]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <ResponsiveColumn>
        <View style={styles.headerWrap}>
          <ProfileHeaderPill
            name={name}
            initials={initials}
            completedDays={completedDays}
            today={today}
            streak={streak}
          />
        </View>
        <DateStrip
          week={week}
          totalWeeks={totalWeeks}
          weekDot={`${week}.${today}`}
          longDate={longDateLabel}
        />
      </ResponsiveColumn>

      <ResponsiveColumn>
        <View style={styles.feed}>
          {feed.length === 0 ? (
            <Text style={styles.empty}>
              No nalogs yet — follow someone or write your first week to fill the feed.
            </Text>
          ) : (
            feed.map(({ post, bio }) => (
              <NalogFeedCard key={post.id} post={post} bio={bio} />
            ))
          )}
        </View>
      </ResponsiveColumn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xs,
  },
  headerWrap: {
    paddingHorizontal: 0,
  },
  feed: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  empty: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  tabBarHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
