import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NalogCard } from '@/components/NalogCard';
import { GlassView } from '@/components/GlassView';
import { colors, fonts, spacing } from '@/constants/theme';
import { FeedPost, fetchFeed } from '@/lib/feedApi';
import { useAuth } from '@/lib/auth';
import { getISOWeek, getISOWeekYear } from '@/lib/date';

const APP_BAR_HEIGHT = 60;

export default function HomeScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const week = getISOWeek(now);
  const year = getISOWeekYear(now);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const data = await fetchFeed(session.user.id);
      setPosts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const topPad = insets.top + APP_BAR_HEIGHT;

  return (
    <View style={styles.root}>
      {/* Glass app bar */}
      <GlassView
        variant="elevated"
        style={[styles.appBar, { paddingTop: insets.top, height: insets.top + APP_BAR_HEIGHT }]}
        borderRadius={0}
      >
        <View style={styles.appBarInner}>
          <Text style={styles.wordmark}>nalog</Text>
          <Text style={styles.weekLabel}>{`w${week} · ${year}`}</Text>
        </View>
      </GlassView>

      {loading ? (
        <View style={[styles.center, { paddingTop: topPad }]}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          contentContainerStyle={[styles.list, { paddingTop: topPad + spacing.md }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              progressViewOffset={topPad}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>✦</Text>
              <Text style={styles.emptyTitle}>Your feed is quiet.</Text>
              <Text style={styles.emptyBody}>
                Discover people from the Community tab and follow them to see their weeks here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <NalogCard
              userId={item.user_id}
              displayName={item.profile?.display_name ?? 'Someone'}
              weekNumber={item.week_number}
              year={item.year}
              title={item.title}
              body={item.body}
              publishedAt={item.published_at}
              onPress={() =>
                router.push({
                  pathname: '/n/[id]',
                  params: {
                    id: item.id,
                    userId: item.user_id,
                    year: item.year,
                    week: item.week_number,
                  },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  appBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0,
  },
  weekLabel: {
    fontFamily: fonts.rounded,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textFaint,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  sep: { height: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    paddingTop: spacing.xl * 2,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 36,
    color: colors.accentMuted,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
  },
});
