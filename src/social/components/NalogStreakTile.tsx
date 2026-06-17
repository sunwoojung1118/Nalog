import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { useCurrentDate } from '@/lib/useCurrentDate';
import { useStreak, usePublishedNalogs } from '@/social/data/social-store';
import { DashboardTile } from './DashboardTile';

type Props = {
  onPress?: () => void;
};

export function NalogStreakTile({ onPress }: Props) {
  const { week } = useCurrentDate();
  const { streak } = useStreak(week);
  const { posts } = usePublishedNalogs();
  const latest = posts[0];
  const published = posts.length;

  const caption = latest?.subtitle || latest?.body?.slice(0, 60) || 'Start your first week.';

  return (
    <DashboardTile
      topLeft={`Streak ${streak} day${streak === 1 ? '' : 's'}`}
      caption={caption}
      onPress={onPress}
    >
      <View style={styles.body}>
        <Text style={styles.eyebrow}>Photos</Text>
        <Text style={styles.number}>{`${published}/52`}</Text>
      </View>
    </DashboardTile>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.3,
  },
  number: {
    fontFamily: fonts.serif,
    fontSize: 44,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.5,
  },
});
