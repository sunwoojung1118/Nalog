import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { follow, fetchFollowingIds, unfollow } from '@/lib/followApi';
import { fetchAllProfiles, initials, Profile } from '@/lib/profileApi';

export default function SearchScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [people, setPeople] = useState<Profile[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;
    fetchAllProfiles().then((all) =>
      setPeople(all.filter((p) => p.id !== session.user.id)),
    );
    fetchFollowingIds(session.user.id).then((ids) => setFollowingIds(new Set(ids)));
  }, [session]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((p) =>
      `${p.display_name} ${p.bio}`.toLowerCase().includes(needle),
    );
  }, [q, people]);

  const handleToggleFollow = useCallback(
    async (targetId: string) => {
      if (!session) return;
      const isFollowing = followingIds.has(targetId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        isFollowing ? next.delete(targetId) : next.add(targetId);
        return next;
      });
      if (isFollowing) {
        await unfollow(session.user.id, targetId);
      } else {
        await follow(session.user.id, targetId);
      }
    },
    [session, followingIds],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.field}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Find people"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            selectionColor={colors.accent}
            autoCapitalize="none"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>{q.trim() ? 'No one matches that.' : 'No users yet.'}</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => {
          const isFollowing = followingIds.has(item.id);
          return (
            <View style={styles.row}>
              <Pressable
                style={styles.rowLeft}
                onPress={() => router.push({ pathname: '/u/[id]', params: { id: item.id } })}
              >
                <Avatar initials={initials(item.display_name)} size={44} />
                <View style={styles.rowText}>
                  <Text style={styles.rowName} numberOfLines={1}>{item.display_name || 'Someone'}</Text>
                  {item.bio ? <Text style={styles.rowBio} numberOfLines={1}>{item.bio}</Text> : null}
                </View>
              </Pressable>
              <Pressable
                onPress={() => handleToggleFollow(item.id)}
                style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                hitSlop={8}
              >
                <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingTop: spacing.md,
  },
  field: {
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  sep: { height: 1, backgroundColor: colors.divider },
  empty: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.textFaint,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: { flex: 1 },
  rowName: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowBio: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textSoft,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
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
  followTextActive: { color: '#FFFFFF', fontWeight: '700' },
});
