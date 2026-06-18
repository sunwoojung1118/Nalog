import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useDiscoverPeople } from '@/lib/followStore';
import { Avatar } from '@/social/components/Avatar';
import { profileInitials, useDiscoverCommunities } from '@/social/data/social-store';

type Props = { contentBottomPadding: number };

export function SearchTab({ contentBottomPadding }: Props) {
  const { session } = useAuth();
  const viewerId = session?.user.id ?? null;
  const [q, setQ] = useState('');
  const { people, followingSet, toggle, hydrated } = useDiscoverPeople(viewerId);
  const discover = useDiscoverCommunities([]);

  const filteredPeople = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((p) =>
      `${p.display_name} ${p.bio}`.toLowerCase().includes(needle),
    );
  }, [q, people]);

  const filteredCommunities = useMemo(() => {
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

      <View style={styles.fieldWrap}>
        <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.fieldOverlay]} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="People, communities, tags"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          selectionColor={colors.accent}
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.sectionTitle}>People</Text>
      {!hydrated ? null : filteredPeople.length === 0 ? (
        <Text style={styles.emptyLine}>
          {q.trim() ? 'No people match that.' : 'No one else has signed up yet.'}
        </Text>
      ) : (
        filteredPeople.map((p) => {
          const isFollowing = followingSet.has(p.id);
          const name = p.display_name || 'Someone';
          return (
            <View key={p.id} style={styles.row}>
              <Pressable
                style={styles.personLeft}
                onPress={() =>
                  router.push({ pathname: '/u/[id]', params: { id: p.id } })
                }
              >
                <Avatar initials={profileInitials(p.display_name)} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{name}</Text>
                  {p.bio ? (
                    <Text style={styles.rowBlurb} numberOfLines={1}>{p.bio}</Text>
                  ) : null}
                </View>
              </Pressable>
              <Pressable
                onPress={() => toggle(p.id)}
                style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                hitSlop={8}
              >
                <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Communities</Text>
      {filteredCommunities.length === 0 ? (
        <Text style={styles.emptyLine}>Nothing matches that yet.</Text>
      ) : (
        filteredCommunities.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{c.name}</Text>
              <Text style={styles.rowBlurb} numberOfLines={1}>{c.blurb}</Text>
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
    color: colors.textFaint,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.text,
    fontWeight: '700',
  },
  fieldWrap: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  fieldOverlay: {
    backgroundColor: 'rgba(10,10,15,0.40)',
    borderRadius: radius.pill,
  },
  input: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textFaint,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyLine: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.textFaint,
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
  personLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowName: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.text,
    fontWeight: '700',
  },
  rowBlurb: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textSoft,
    marginTop: 2,
  },
  rowMeta: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textFaint,
  },
  followBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  followBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  followText: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textSoft,
  },
  followTextActive: {
    color: '#FFFFFF',
  },
});
