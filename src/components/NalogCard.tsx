import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { initials } from '@/lib/profileApi';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

type Props = {
  userId: string;
  displayName: string;
  weekNumber: number;
  year: number;
  title: string;
  body: string;
  publishedAt: string;
  onPress: () => void;
  compact?: boolean;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function gradientIndex(userId: string, weekNumber: number): number {
  const charCode = userId.charCodeAt(0) || 0;
  return (charCode ^ weekNumber) % colors.coverGradients.length;
}

export function NalogCard({
  userId,
  displayName,
  weekNumber,
  year,
  title,
  body,
  publishedAt,
  onPress,
  compact = false,
}: Props) {
  const excerpt = body.length > 140 ? body.slice(0, 140).trimEnd() + '…' : body;
  const [start, end] = colors.coverGradients[gradientIndex(userId, weekNumber)];
  const coverHeight = compact ? 100 : 160;

  const handleShare = async () => {
    try {
      await Share.share({ message: `"${title}" — Week ${weekNumber}, ${year}` });
    } catch { /* noop */ }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Gradient cover */}
      <LinearGradient
        colors={[start, end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cover, { height: coverHeight }]}
      >
        {/* Author overlay */}
        <View style={styles.authorRow}>
          <Avatar initials={initials(displayName)} size={28} borderColor="rgba(255,255,255,0.5)" />
          <Text style={styles.authorName} numberOfLines={1}>{displayName || 'Someone'}</Text>
          <Text style={styles.authorTime}>{timeAgo(publishedAt)}</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.weekLabel}>{`w${weekNumber} · ${year}`}</Text>
        {title ? (
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
        ) : null}
        {excerpt && !compact ? (
          <Text style={styles.excerpt} numberOfLines={3}>{excerpt}</Text>
        ) : null}

        {/* Engagement row */}
        {!compact ? (
          <View style={styles.engagement}>
            <View style={styles.engagementLeft}>
              <View style={styles.engagementItem}>
                <Icon name="flame" size={14} color={colors.textSoft} />
                <Text style={styles.engagementCount}>0</Text>
              </View>
              <View style={styles.engagementItem}>
                <Icon name="bubble.left" size={14} color={colors.textSoft} />
                <Text style={styles.engagementCount}>0</Text>
              </View>
            </View>
            <View style={styles.engagementRight}>
              <Pressable onPress={handleShare} hitSlop={8}>
                <Icon name="square.and.arrow.up" size={16} color={colors.textFaint} />
              </Pressable>
              <Icon name="bookmark" size={16} color={colors.textFaint} />
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.postCard,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardCompact: {
    width: 200,
  },
  cardPressed: { opacity: 0.88 },
  cover: {
    justifyContent: 'flex-end',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  authorName: {
    fontFamily: fonts.rounded,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  authorTime: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.80)',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  weekLabel: {
    fontFamily: fonts.rounded,
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
    marginTop: 2,
  },
  excerpt: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textSoft,
    lineHeight: 22,
    marginTop: 2,
  },
  engagement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  engagementLeft: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  engagementRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementCount: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSoft,
  },
});
