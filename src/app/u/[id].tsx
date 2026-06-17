import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/theme';
import { Avatar } from '@/social/components/Avatar';
import { PostTile } from '@/social/components/PostTile';
import { findFollowedUser, getPostsByAuthor } from '@/social/data/social-store';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = id ? findFollowedUser(id) : null;
  const posts = id ? getPostsByAuthor(id) : [];

  if (!user) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backWrap}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.missing}>That user isn{`'`}t around.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backWrap}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <View style={styles.identity}>
        <Avatar initials={user.initials} size={72} />
        <Text style={styles.name}>{user.name}</Text>
        {user.bio ? <Text style={styles.bio}>{`bio - ${user.bio}`}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Recent</Text>
      {posts.length === 0 ? (
        <Text style={styles.empty}>No posts yet.</Text>
      ) : (
        <View style={styles.list}>
          {posts.map((p, i) => (
            <PostTile
              key={p.id}
              post={p}
              variant={i % 2 === 0 ? 'photos' : 'log'}
              width={280}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.community,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  backWrap: {
    paddingVertical: spacing.sm,
  },
  back: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.inkSoft,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
    fontWeight: '700',
  },
  bio: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    maxWidth: 320,
  },
  sectionTitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.inkFaint,
    textTransform: 'uppercase',
  },
  list: {
    gap: spacing.lg,
    alignItems: 'center',
  },
  empty: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.inkFaint,
  },
  missing: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.inkSoft,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
});
