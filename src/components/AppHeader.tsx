import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveColumn } from './ResponsiveColumn';
import { colors, fonts, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { isoWeeksInYear } from '@/lib/date';
import { useSignedImageUrl } from '@/lib/postImages';
import { profileInitials, useMyProfile } from '@/social/data/social-store';

type Props = {
  year: number;
  week: number;
  meta?: string;
};

export function AppHeader({ year, week, meta }: Props) {
  const insets = useSafeAreaInsets();
  const total = useMemo(() => isoWeeksInYear(year), [year]);
  const progress = Math.min(1, Math.max(0, week / total));

  const fill = useSharedValue(0);
  React.useEffect(() => {
    fill.value = withTiming(progress, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [progress, fill]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  const { session } = useAuth();
  const profile = useMyProfile();
  const initials = profileInitials(profile.name);
  void useSignedImageUrl(null);

  return (
    <View style={[styles.shell, { paddingTop: insets.top + spacing.sm }]}>
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(13,13,22,0.85)', 'rgba(10,10,15,0.60)']}
        style={StyleSheet.absoluteFill}
      />
      <ResponsiveColumn>
        <View style={styles.row}>
          <Text style={styles.brand}>Nalog</Text>
          <View style={styles.weekBlock}>
            <Text style={styles.weekLabel}>
              <Text style={styles.weekNum}>{week}</Text>
              <Text style={styles.weekSep}>{`/${total}`}</Text>
            </Text>
            <View style={styles.track}>
              <Animated.View style={[styles.fill, fillStyle]} />
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={10}
            disabled={!session}
            style={styles.avatar}
            accessibilityLabel="Open settings"
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </ResponsiveColumn>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
    paddingBottom: spacing.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  weekBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekLabel: {
    fontFamily: fonts.serifItalic,
    color: colors.text,
  },
  weekNum: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  weekSep: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.textFaint,
    letterSpacing: 0.6,
  },
  track: {
    width: '60%',
    maxWidth: 220,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.glassElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.glassElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.serif,
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  meta: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'right',
    marginTop: 4,
  },
});
