import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { formatTileDate } from '@/lib/formatDate';
import { NalogPost } from '@/social/data/types';

type Variant = 'log' | 'photos';

type Props = {
  post: NalogPost;
  variant?: Variant;
  width?: number;
};

export function PostTile({ post, variant = 'log', width = 180 }: Props) {
  const date = new Date(post.publishedAt ?? post.createdAt);
  const topCaption = `upload ${formatTileDate(date)}`;
  const bottomCaption = post.subtitle || post.body.slice(0, 60);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/n/[id]', params: { id: post.id } })}
      style={[styles.wrap, { width }]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${post.authorName}'s post`}
    >
      <Text style={styles.topCaption} numberOfLines={1}>
        {topCaption}
      </Text>

      <View style={styles.tile}>
        <Text style={styles.eyebrow}>Photos</Text>
        <Text style={styles.bigLabel}>{variant === 'photos' ? '26/52' : 'Log'}</Text>
      </View>

      <Text style={styles.bottomCaption} numberOfLines={2}>
        {bottomCaption}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  topCaption: {
    fontFamily: fonts.serif,
    fontSize: 12,
    color: colors.inkSoft,
    paddingHorizontal: spacing.sm,
  },
  tile: {
    aspectRatio: 1,
    backgroundColor: colors.paperWarm,
    borderRadius: radius.tile,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
    ...shadows.tile,
  },
  eyebrow: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.3,
  },
  bigLabel: {
    fontFamily: fonts.serif,
    fontSize: 36,
    fontWeight: '700',
    color: colors.ink,
    alignSelf: 'flex-end',
  },
  bottomCaption: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    lineHeight: 18,
  },
});
