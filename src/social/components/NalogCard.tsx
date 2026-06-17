import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { Nalog } from '@/social/data/types';
import { Avatar } from './Avatar';

export function NalogCard({ entry }: { entry: Nalog }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar initials={entry.authorInitials} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{entry.authorName}</Text>
          <Text style={styles.meta}>{`w${entry.week}  ·  n.${entry.day}`}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{entry.subtitle}</Text>
      <Text style={styles.body}>{entry.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.paper,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.inkFaint,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkSoft,
  },
});
