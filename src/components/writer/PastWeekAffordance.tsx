import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

type Props = {
  onActivate?: () => void;
};

export function PastWeekAffordance({ onActivate }: Props) {
  return (
    <Pressable onPress={onActivate} style={styles.wrap} accessibilityRole="button">
      <View style={styles.divider} />
      <Text style={styles.chevron}>↑</Text>
      <Text style={styles.text}>scroll up for this week’s past Nalog</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  divider: {
    width: 40,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginBottom: spacing.xs,
  },
  chevron: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.inkFaint,
  },
  text: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.3,
  },
});
