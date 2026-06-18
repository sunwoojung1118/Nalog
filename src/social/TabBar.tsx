import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fonts, shadows, spacing } from '@/constants/theme';

export type TabKey = 'home' | 'search' | 'community' | 'profile';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'search', label: 'Search' },
  { key: 'community', label: 'Community' },
  { key: 'profile', label: 'Profile' },
];

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
  onNalog: () => void;
  onNalogLayout?: (e: { x: number; y: number; width: number; height: number }) => void;
};

const SPRING = { damping: 20, stiffness: 90 };

export function TabBar({ active, onChange, onNalog, onNalogLayout }: Props) {
  function handleChange(key: TabKey) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(key);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.pillWrap}>
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.pillOverlay]} />
        <View style={styles.pill}>
          {TABS.map((t) => (
            <TabItem
              key={t.key}
              tabKey={t.key}
              label={t.label}
              isActive={active === t.key}
              onPress={() => handleChange(t.key)}
            />
          ))}
        </View>
      </View>

      <Pressable
        onPress={onNalog}
        style={styles.nalogWrap}
        accessibilityRole="button"
        accessibilityLabel="Write a Nalog"
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          onNalogLayout?.({ x, y, width, height });
        }}
      >
        <LinearGradient
          colors={[colors.accent, colors.accentDeep]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.nalogDot}
        >
          <Text style={styles.nalogLabel}>Nalog</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function TabItem({
  tabKey,
  label,
  isActive,
  onPress,
}: {
  tabKey: TabKey;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const dotOpacity = useSharedValue(isActive ? 1 : 0);
  const dotScale = useSharedValue(isActive ? 1 : 0.4);

  React.useEffect(() => {
    dotOpacity.value = withSpring(isActive ? 1 : 0, SPRING);
    dotScale.value = withSpring(isActive ? 1 : 0.4, SPRING);
  }, [isActive, dotOpacity, dotScale]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      hitSlop={6}
    >
      <Icon tabKey={tabKey} isActive={isActive} />
      <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </Pressable>
  );
}

function Icon({ tabKey, isActive }: { tabKey: TabKey; isActive: boolean }) {
  const color = isActive ? colors.accent : colors.textFaint;
  const ICON_SIZE = 18;
  switch (tabKey) {
    case 'home':
      return <View style={[iconStyles.diamond, { backgroundColor: color }]} />;
    case 'search':
      return <View style={[iconStyles.circle, { backgroundColor: color }]} />;
    case 'community':
      return (
        <View style={[iconStyles.triangle, { borderBottomColor: color }] as ViewStyle[]} />
      );
    case 'profile':
      return <View style={[iconStyles.hex, { backgroundColor: color }]} />;
  }
}

const ICON_SIZE = 18;

const iconStyles = StyleSheet.create({
  diamond: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  circle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: ICON_SIZE / 2 + 1,
    borderRightWidth: ICON_SIZE / 2 + 1,
    borderBottomWidth: ICON_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  hex: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 4,
    transform: [{ rotate: '20deg' }],
  },
});

const PILL_HEIGHT = 72;
const NALOG_SIZE = 64;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pillWrap: {
    flex: 1,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.tile,
  },
  pillOverlay: {
    backgroundColor: 'rgba(10,10,15,0.40)',
    borderRadius: PILL_HEIGHT / 2,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: PILL_HEIGHT - 12,
    gap: 4,
  },
  label: {
    fontFamily: fonts.serif,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  nalogWrap: {
    width: NALOG_SIZE,
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nalogDot: {
    width: NALOG_SIZE,
    height: NALOG_SIZE,
    borderRadius: NALOG_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lift,
  },
  nalogLabel: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
