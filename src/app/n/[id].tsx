import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/theme';
import { Avatar } from '@/social/components/Avatar';
import { findFriendPost } from '@/social/data/social-store';
import { formatRelative } from '@/lib/formatDate';

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const post = id ? findFriendPost(id) : null;

  if (!post) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backWrap}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.missing}>That post isn{`'`}t around.</Text>
      </View>
    );
  }

  const date = new Date(post.publishedAt ?? post.createdAt);

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

      <Pressable
        onPress={() => router.push({ pathname: '/u/[id]', params: { id: post.authorId } })}
        style={styles.author}
      >
        <Avatar initials={post.authorInitials} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.authorMeta}>{formatRelative(date)}</Text>
        </View>
      </Pressable>

      {post.subtitle ? <Text style={styles.subtitle}>{post.subtitle}</Text> : null}
      <Text style={styles.body}>{post.body}</Text>
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
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  authorName: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    fontWeight: '700',
  },
  authorMeta: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.inkFaint,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.ink,
    fontWeight: '700',
    lineHeight: 30,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: 17,
    lineHeight: 28,
    color: colors.ink,
  },
  missing: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.inkSoft,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
});
