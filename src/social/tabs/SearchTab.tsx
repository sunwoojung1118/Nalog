import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useDiscoverCommunities } from '@/social/data/social-store';

type Props = { contentBottomPadding: number };

export function SearchTab({ contentBottomPadding }: Props) {
  const [q, setQ] = useState('');
  const discover = useDiscoverCommunities([]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return discover;
    return discover.filter((c) =>
      `${c.name} ${c.tag} ${c.blurb}`.toLowerCase().includes(needle),
    );
  }, [q, discover]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Search</Text>
        <Text style={styles.headline}>Find a corner.</Text>
      </View>

      <View style={styles.field}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="People, communities, tags"
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          selectionColor={colors.amber}
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.sectionTitle}>
        {q.trim() ? 'Matches' : 'Suggested communities'}
      </Text>
      {results.length === 0 ? (
        <Text style={styles.emptyLine}>Nothing matches that yet.</Text>
      ) : (
        results.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{c.name}</Text>
              <Text style={styles.rowBlurb} numberOfLines={1}>
                {c.blurb}
              </Text>
            </View>
            <Text style={styles.rowMeta}>{`#${c.tag}  ·  ${c.memberCount}`}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: spacing.md },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.inkSoft,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
    fontWeight: '700',
  },
  field: {
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  input: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.inkFaint,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyLine: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.inkFaint,
    paddingHorizontal: spacing.lg,
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowName: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.ink,
    fontWeight: '700',
  },
  rowBlurb: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 2,
  },
  rowMeta: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.inkFaint,
  },
});
