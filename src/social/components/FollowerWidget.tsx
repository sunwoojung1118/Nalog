import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatRelative } from '@/lib/formatDate';
import { Friend, NalogPost } from '@/social/data/types';
import { Avatar } from './Avatar';
import { PostTile } from './PostTile';

type Props = {
  user: Friend;
  posts: NalogPost[];
};

const TILE_WIDTH = 180;

export function FollowerWidget({ user, posts }: Props) {
  const latest = posts[0];
  const latestAt = latest ? latest.publishedAt ?? latest.createdAt : null;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => router.push({ pathname: '/u/[id]', params: { id: user.id } })}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={`Open ${user.name}'s profile`}
      >
        <Avatar initials={user.initials} size={44} />
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {latestAt ? (
              <Text style={styles.relative}>{`· ${formatRelative(new Date(latestAt))}`}</Text>
            ) : null}
          </View>
          {user.bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {`bio - ${user.bio}`}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {posts.length === 0 ? (
        <Text style={styles.empty}>Nothing this week.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
        >
          {posts.map((p, i) => (
            <PostTile
              key={p.id}
              post={p}
              variant={i % 2 === 0 ? 'photos' : 'log'}
              width={TILE_WIDTH}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  identity: {
    flex: 1,
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
    fontWeight: '700',
  },
  relative: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.inkFaint,
  },
  bio: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.ink,
    marginTop: 2,
  },
  strip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  empty: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.inkFaint,
    paddingHorizontal: spacing.lg,
  },
});
