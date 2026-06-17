import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';

type Props = {
  caption?: string;
  topRight?: string;
  topLeft?: string;
  children?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export function DashboardTile({
  caption,
  topRight,
  topLeft,
  children,
  onPress,
  style,
}: Props) {
  const Container: React.ElementType = onPress ? Pressable : View;
  return (
    <View style={[styles.outer, style]}>
      {topLeft || topRight ? (
        <View style={styles.topRow}>
          <Text style={styles.topText}>{topLeft ?? ''}</Text>
          <Text style={styles.topText}>{topRight ?? ''}</Text>
        </View>
      ) : null}
      <Container onPress={onPress} style={styles.tile}>
        {children}
      </Container>
      {caption ? (
        <Text style={styles.caption} numberOfLines={2}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  topText: {
    fontFamily: fonts.serif,
    fontSize: 12,
    color: colors.inkSoft,
    letterSpacing: 0.3,
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
  caption: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    lineHeight: 18,
  },
});
