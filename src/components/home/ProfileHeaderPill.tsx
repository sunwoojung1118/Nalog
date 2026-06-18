import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { DayIndex } from '@/lib/date';

type Props = {
  name: string;
  initials: string;
  completedDays: Set<DayIndex>;
  today: DayIndex;
  streak: number;
  notificationCount?: number;
  onPressBell?: () => void;
  onPressAvatar?: () => void;
};

const DAY_LETTERS: { idx: DayIndex; letter: string }[] = [
  { idx: 1, letter: 'M' },
  { idx: 2, letter: 'T' },
  { idx: 3, letter: 'W' },
  { idx: 4, letter: 'T' },
  { idx: 5, letter: 'F' },
  { idx: 6, letter: 'S' },
  { idx: 7, letter: 'S' },
];

export function ProfileHeaderPill({
  name,
  initials,
  completedDays,
  today,
  streak,
  notificationCount = 0,
  onPressBell,
  onPressAvatar,
}: Props) {
  return (
    <View style={styles.shellWrap}>
      <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.shellOverlay]} />
      <View style={styles.shell}>
        <Pressable
          onPress={onPressAvatar ?? (() => router.push('/settings'))}
          style={styles.avatar}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <View style={styles.avatarMark}>
            <Text style={styles.avatarMarkText}>{initials || '*'}</Text>
          </View>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.name} numberOfLines={1}>
            {name || 'Your name'}
          </Text>
          <View style={styles.row}>
            <View style={styles.days}>
              {DAY_LETTERS.map(({ idx, letter }) => {
                const done = completedDays.has(idx);
                const isToday = idx === today;
                return (
                  <View key={idx} style={styles.dayCol}>
                    <View
                      style={[
                        styles.dayDot,
                        done && styles.dayDotDone,
                        isToday && !done && styles.dayDotToday,
                      ]}
                    >
                      {done ? <Text style={styles.dayCheck}>✓</Text> : null}
                    </View>
                    <Text style={styles.dayLetter}>{letter}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.streak}>
              <Text style={styles.flame}>🔥</Text>
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onPressBell}
          style={styles.bellWrap}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Text style={styles.bell}>🔔</Text>
          {notificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const DOT_SIZE = 16;

const styles = StyleSheet.create({
  shellWrap: {
    borderRadius: radius.headerPill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.tile,
  },
  shellOverlay: {
    backgroundColor: 'rgba(10,10,15,0.45)',
    borderRadius: radius.headerPill,
  },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentGlow,
    borderWidth: 1.5,
    borderColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMarkText: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  center: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  days: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCol: {
    alignItems: 'center',
    gap: 2,
  },
  dayDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayDotToday: {
    borderColor: colors.accentSoft,
  },
  dayCheck: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  dayLetter: {
    fontFamily: fonts.serif,
    fontSize: 9,
    color: colors.textFaint,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 4,
  },
  flame: {
    fontSize: 14,
  },
  streakNum: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.accent,
    fontWeight: '800',
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.serif,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
