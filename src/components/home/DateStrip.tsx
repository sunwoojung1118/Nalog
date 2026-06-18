import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

type Props = {
  week: number;
  totalWeeks: number;
  /** Day-of-year as "25.4" (week.day-of-week). */
  weekDot: string;
  /** Full date label, e.g. "Thursday, June 18, 2026". */
  longDate: string;
};

export function DateStrip({ week, totalWeeks, weekDot, longDate }: Props) {
  return (
    <View style={styles.shell}>
      <Text style={styles.counter}>
        <Text style={styles.weekNum}>{week}</Text>
        <Text style={styles.weekSep}>{`/${totalWeeks}`}</Text>
        <Text style={styles.sepBar}>{'  |  '}</Text>
        <Text style={styles.weekDot}>{weekDot}</Text>
      </Text>
      <Text style={styles.long}>{longDate}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  counter: {
    textAlign: 'center',
  },
  weekNum: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  weekSep: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  sepBar: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.accent,
  },
  weekDot: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.accent,
    fontWeight: '700',
  },
  long: {
    fontFamily: fonts.serif,
    fontSize: 12,
    color: colors.accentDeep,
    letterSpacing: 0.3,
  },
  rule: {
    height: 1,
    width: '70%',
    marginTop: spacing.sm,
    backgroundColor: colors.accentSoft,
    opacity: 0.55,
  },
});
