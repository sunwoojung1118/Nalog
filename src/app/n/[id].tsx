import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { GlassView } from '@/components/GlassView';
import { colors, fonts, spacing } from '@/constants/theme';
import { FeedPost, fetchPost } from '@/lib/feedApi';
import { initials } from '@/lib/profileApi';

const TOPBAR_HEIGHT = 52;

export default function PostDetail() {
  const { userId, year, week } = useLocalSearchParams<{ userId: string; year: string; week: string }>();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !year || !week) return;
    fetchPost(userId, Number(year), Number(week))
      .then(setPost)
      .finally(() => setLoading(false));
  }, [userId, year, week]);

  return (
    <View style={styles.root}>
      {/* Glass top bar */}
      <GlassView
        variant="elevated"
        style={[styles.topBar, { paddingTop: insets.top, height: insets.top + TOPBAR_HEIGHT }]}
        borderRadius={0}
      >
        <View style={styles.topBarInner}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          {post ? (
            <Text style={styles.topBarWeek}>{`w${post.week_number} · ${post.year}`}</Text>
          ) : null}
          <View style={{ width: 60 }} />
        </View>
      </GlassView>

      {loading ? (
        <View style={[styles.center, { paddingTop: insets.top + TOPBAR_HEIGHT }]}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : !post ? (
        <View style={[styles.center, { paddingTop: insets.top + TOPBAR_HEIGHT }]}>
          <Text style={styles.notFound}>Post not found.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + TOPBAR_HEIGHT + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.author}
            onPress={() => router.push({ pathname: '/u/[id]', params: { id: post.user_id } })}
          >
            <Avatar initials={initials(post.profile?.display_name ?? '')} size={44} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.profile?.display_name || 'Someone'}</Text>
              <Text style={styles.authorMeta}>View profile →</Text>
            </View>
          </Pressable>

          {post.title ? <Text style={styles.title}>{post.title}</Text> : null}
          {post.body ? <Text style={styles.body}>{post.body}</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  back: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.accent,
    fontWeight: '600',
  },
  topBarWeek: {
    fontFamily: fonts.rounded,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textFaint,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textSoft,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 3,
    gap: spacing.lg,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.bgDeep,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontFamily: fonts.rounded,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  authorMeta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.accent,
    marginTop: 2,
    fontWeight: '500',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.text,
    lineHeight: 30,
  },
});
