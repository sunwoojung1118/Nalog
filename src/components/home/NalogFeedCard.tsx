import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { Block, ImageBlock } from '@/lib/blocks';
import { isoWeeksInYear } from '@/lib/date';
import { useSignedImageUrl } from '@/lib/postImages';
import { NalogPost } from '@/social/data/types';

type Habit = { name: string; checked: number; total: number };

type Props = {
  post: NalogPost;
  bio?: string;
  handle?: string;
  tags?: string[];
  habits?: Habit[];
  commentCount?: number;
  viewCount?: number;
};

function deriveHandle(name: string): string {
  return `@${(name || 'someone')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '')}`;
}

function timeLeftLabel(publishedAt: number, year: number, week: number): string {
  const d = new Date(publishedAt);
  const day = d.getDay() || 7;
  const endOfWeek = new Date(d);
  endOfWeek.setDate(d.getDate() + (7 - day));
  endOfWeek.setHours(23, 59, 59, 999);
  const ms = endOfWeek.getTime() - Date.now();
  if (ms <= 0) return `w${week} closed`;
  const totalHours = Math.floor(ms / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  return `${minutes}m left`;
}

function collectImagePaths(post: NalogPost): string[] {
  const paths: string[] = [];
  if (post.image_path) paths.push(post.image_path);
  for (const b of post.blocks) {
    if (b.type === 'image' && b.path && !paths.includes(b.path)) {
      paths.push(b.path);
    }
  }
  return paths.slice(0, 3);
}

function bodyTextFromBlocks(blocks: Block[]): string {
  return blocks
    .filter((b): b is Exclude<Block, ImageBlock> => b.type !== 'image')
    .map((b) => b.text)
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

const PRESS_SPRING = { damping: 22, stiffness: 200 };

export function NalogFeedCard({
  post,
  bio,
  handle,
  tags = [],
  habits = [],
  commentCount = 0,
  viewCount = 0,
}: Props) {
  const totalWeeks = useMemo(() => isoWeeksInYear(post.year), [post.year]);
  const handleText = handle || deriveHandle(post.authorName);
  const timeLeft = useMemo(
    () => timeLeftLabel(post.publishedAt ?? post.createdAt, post.year, post.week),
    [post.publishedAt, post.createdAt, post.year, post.week],
  );

  const imagePaths = collectImagePaths(post);
  const body = post.body?.trim() || bodyTextFromBlocks(post.blocks);

  const scale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gesture = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.97, PRESS_SPRING); })
    .onFinalize(() => {
      scale.value = withSpring(1, PRESS_SPRING);
      router.push({ pathname: '/n/[id]', params: { id: post.id } });
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.card, cardStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${post.authorName}'s week ${post.week}`}
      >
        {/* Header */}
        <View style={styles.headerWrap}>
          <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.headerOverlay]} />
          <View style={styles.darkHeader}>
            <Animated.View
              style={styles.avatar}
              accessibilityRole="button"
            >
              <Text style={styles.avatarText}>{post.authorInitials}</Text>
            </Animated.View>

            <View style={styles.headIdentity}>
              <View style={styles.headNameRow}>
                <Text style={styles.headName} numberOfLines={1}>
                  {post.authorName}
                </Text>
                <Text style={styles.headHandle} numberOfLines={1}>
                  {handleText}
                </Text>
              </View>
              {bio ? (
                <Text style={styles.headBio} numberOfLines={2}>{bio}</Text>
              ) : null}
              {tags.length > 0 ? (
                <View style={styles.tagsRow}>
                  {tags.slice(0, 3).map((t) => (
                    <Text key={t} style={styles.tag}>{`• ${t}`}</Text>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.timePill}>
              <Text style={styles.timePillDot}>◷</Text>
              <Text style={styles.timePillText}>{timeLeft}</Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.weekBlock}>
              <Text style={styles.weekNum}>{post.week}</Text>
              <Text style={styles.weekDenom}>{`/${totalWeeks}`}</Text>
            </View>
            <View style={styles.titleRight}>
              <View style={styles.dotProgress}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const filled = i < post.day;
                  return (
                    <View key={i} style={styles.dotCol}>
                      <View style={[styles.progressDot, filled && styles.progressDotFilled]}>
                        {filled ? <Text style={styles.progressCheck}>✓</Text> : null}
                      </View>
                      <Text style={styles.dotLabel}>{`.${i + 1}`}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.subject} numberOfLines={1}>
                {post.subtitle || post.caption || 'untitled'}
              </Text>
            </View>
          </View>

          {body ? (
            <Text style={styles.bodyText} numberOfLines={6}>{body}</Text>
          ) : null}

          {imagePaths.length > 0 ? <ImageGrid paths={imagePaths} /> : null}

          {habits.length > 0 ? <HabitsRow habits={habits} /> : null}

          <View style={styles.footer}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statText}>{commentCount}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>👁</Text>
              <Text style={styles.statText}>{viewCount}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function ImageGrid({ paths }: { paths: string[] }) {
  return (
    <View style={styles.imageGrid}>
      <View style={styles.imageGridMain}>
        <ImageSlot path={paths[0]} />
      </View>
      {paths.length > 1 ? (
        <View style={styles.imageGridSide}>
          <View style={styles.imageGridSideCell}>
            <ImageSlot path={paths[1]} />
          </View>
          {paths[2] ? (
            <View style={styles.imageGridSideCell}>
              <ImageSlot path={paths[2]} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function ImageSlot({ path }: { path: string }) {
  const url = useSignedImageUrl(path);
  if (!url) return <View style={styles.imagePlaceholder} />;
  return <Image source={url} style={styles.image} contentFit="cover" transition={120} />;
}

function HabitsRow({ habits }: { habits: Habit[] }) {
  const rows: Habit[][] = [];
  for (let i = 0; i < habits.length; i += 2) {
    rows.push(habits.slice(i, i + 2));
  }
  return (
    <View style={styles.habits}>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.habitsRow}>
          {row.map((h) => <HabitBar key={h.name} habit={h} />)}
          {row.length === 1 ? <View style={styles.habitCell} /> : null}
        </View>
      ))}
    </View>
  );
}

function HabitBar({ habit }: { habit: Habit }) {
  const pct = habit.total > 0 ? Math.min(1, habit.checked / habit.total) : 0;
  return (
    <View style={styles.habitCell}>
      <View style={styles.habitTrack}>
        <View style={[styles.habitFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.habitLabel} numberOfLines={1}>
        <Text style={styles.habitCount}>{`${habit.checked}/${habit.total} `}</Text>
        {habit.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius.postCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  headerWrap: {
    overflow: 'hidden',
  },
  headerOverlay: {
    backgroundColor: 'rgba(10,10,15,0.55)',
  },
  darkHeader: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentGlow,
    borderWidth: 1.5,
    borderColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headIdentity: {
    flex: 1,
    gap: 2,
  },
  headNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  headName: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  headHandle: {
    fontFamily: fonts.serif,
    fontSize: 12,
    color: colors.textSoft,
  },
  headBio: {
    fontFamily: fonts.serif,
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 2,
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  tag: {
    fontFamily: fonts.serif,
    fontSize: 11,
    color: colors.accentSoft,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  timePillDot: {
    fontSize: 10,
    color: colors.accent,
  },
  timePillText: {
    fontFamily: fonts.serif,
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  weekBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weekNum: {
    fontFamily: fonts.serif,
    fontSize: 48,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: -1,
  },
  weekDenom: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: 2,
  },
  titleRight: {
    flex: 1,
    gap: 4,
  },
  dotProgress: {
    flexDirection: 'row',
    gap: 4,
  },
  dotCol: {
    alignItems: 'center',
    gap: 1,
    flex: 1,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  progressCheck: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  dotLabel: {
    fontFamily: fonts.serif,
    fontSize: 8,
    color: colors.textFaint,
  },
  subject: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
  bodyText: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textSoft,
    lineHeight: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 4,
    height: 160,
    borderRadius: 6,
    overflow: 'hidden',
  },
  imageGridMain: {
    flex: 1,
    backgroundColor: colors.glassElevated,
  },
  imageGridSide: {
    flex: 1,
    gap: 4,
  },
  imageGridSideCell: {
    flex: 1,
    backgroundColor: colors.glassElevated,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.glassElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  habits: {
    gap: spacing.sm,
  },
  habitsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  habitCell: {
    flex: 1,
    gap: 4,
  },
  habitTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accentMuted,
    overflow: 'hidden',
  },
  habitFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  habitLabel: {
    fontFamily: fonts.serif,
    fontSize: 11,
    color: colors.textSoft,
  },
  habitCount: {
    fontWeight: '800',
    color: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.accent,
    fontWeight: '700',
  },
});
