import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { Avatar } from '@/social/components/Avatar';
import { FollowerWidget } from '@/social/components/FollowerWidget';
import {
  profileInitials,
  useFollowedUsersWithPosts,
  useMyProfile,
  usePublishedNalogs,
  useStreak,
} from '@/social/data/social-store';
import { useCurrentDate } from '@/lib/useCurrentDate';

type Props = {
  contentBottomPadding: number;
};

export function HomeTab({ contentBottomPadding }: Props) {
  const { week } = useCurrentDate();
  const { streak } = useStreak(week);
  const nalogs = usePublishedNalogs();
  const followed = useFollowedUsersWithPosts();
  const profile = useMyProfile();
  const initials = profileInitials(profile.name);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dashboard}>
        <Avatar initials={initials} size={44} />
        <Text style={styles.dashLine}>
          {`Streak ${streak} day${streak === 1 ? '' : 's'}  ·  ${nalogs.posts.length} log${nalogs.posts.length === 1 ? '' : 's'}`}
        </Text>
      </View>

      <View style={styles.divider} />

      {followed.map(({ user, posts }, idx) => (
        <React.Fragment key={user.id}>
          {idx > 0 ? <View style={styles.divider} /> : null}
          <FollowerWidget user={user} posts={posts} />
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {},
  dashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  dashLine: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.inkSoft,
    letterSpacing: 0.3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
});
