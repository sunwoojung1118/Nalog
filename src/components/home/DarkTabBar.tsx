import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';

export type TabKey = 'home' | 'community' | 'profile';

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
  onPressCompose: () => void;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'community', label: 'Community' },
  { key: 'profile', label: 'Profile' },
];

const SPRING = { damping: 20, stiffness: 90 };

export function DarkTabBar({ active, onChange, onPressCompose }: Props) {
  const insets = useSafeAreaInsets();

  function handleChange(key: TabKey) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(key);
  }

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(spacing.sm, insets.bottom) }]}>
      <View style={styles.row}>
        <View style={styles.pillWrap}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.pillOverlay]} />
          <View style={styles.pill}>
            {TABS.map((t) => {
              const isActive = active === t.key;
              return (
                <TabItem
                  key={t.key}
                  tabKey={t.key}
                  label={t.label}
                  isActive={isActive}
                  onPress={() => handleChange(t.key)}
                />
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={onPressCompose}
          style={styles.composeWrap}
          accessibilityRole="button"
          accessibilityLabel="Write a Nalog"
          hitSlop={6}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentDeep]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.composeDot}
          >
            <Text style={styles.composeText}>a</Text>
          </LinearGradient>
        </Pressable>
      </View>
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
      <TabIcon tabKey={tabKey} active={isActive} />
      <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </Pressable>
  );
}

function TabIcon({ tabKey, active }: { tabKey: TabKey; active: boolean }) {
  const tint = active ? colors.accent : colors.textFaint;
  switch (tabKey) {
    case 'home':
      return <View style={[iconStyles.flower, { backgroundColor: tint }]} />;
    case 'community':
      return (
        <View style={iconStyles.sparkleWrap}>
          <View style={[iconStyles.sparkleDiamond, { backgroundColor: tint }]} />
        </View>
      );
    case 'profile':
      return <View style={[iconStyles.profileDot, { borderColor: tint }]} />;
  }
}

const iconStyles = StyleSheet.create({
  flower: {
    width: 18,
    height: 18,
    borderRadius: 5,
    transform: [{ rotate: '45deg' }],
  },
  sparkleWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleDiamond: {
    width: 16,
    height: 16,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  profileDot: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
  },
});

const COMPOSE_SIZE = 56;

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pillWrap: {
    flex: 1,
    borderRadius: radius.tabBar,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.tile,
  },
  pillOverlay: {
    backgroundColor: 'rgba(10,10,15,0.40)',
    borderRadius: radius.tabBar,
  },
  pill: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: radius.tabBar - 6,
  },
  label: {
    fontFamily: fonts.serif,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.text,
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 1,
  },
  composeWrap: {
    width: COMPOSE_SIZE,
    height: COMPOSE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeDot: {
    width: COMPOSE_SIZE,
    height: COMPOSE_SIZE,
    borderRadius: COMPOSE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lift,
  },
  composeText: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
