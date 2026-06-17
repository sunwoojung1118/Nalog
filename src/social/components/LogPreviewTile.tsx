import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { formatTileDate } from '@/lib/formatDate';
import { usePublishedLogs } from '@/social/data/social-store';
import { DashboardTile } from './DashboardTile';

type Props = {
  onPress?: () => void;
};

export function LogPreviewTile({ onPress }: Props) {
  const { posts } = usePublishedLogs();
  const latest = posts[0];
  const topLeft = latest
    ? `upload ${formatTileDate(new Date(latest.publishedAt ?? latest.createdAt))}`
    : 'no logs yet';
  const caption = latest?.title || latest?.body?.slice(0, 60) || 'Write your first Log.';

  return (
    <DashboardTile topLeft={topLeft} caption={caption} onPress={onPress}>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>Photos</Text>
        <Text style={styles.label}>Log</Text>
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
  label: {
    fontFamily: fonts.serif,
    fontSize: 44,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.5,
  },
});
