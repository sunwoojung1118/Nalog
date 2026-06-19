import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '@/constants/theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

const TABS: { key: string; label: string; symbol: IconName; symbolActive: IconName }[] = [
  { key: 'index',     label: 'Home',     symbol: 'house',         symbolActive: 'house.fill' },
  { key: 'community', label: 'Discover', symbol: 'safari',        symbolActive: 'safari' },
  { key: 'profile',   label: 'Profile',  symbol: 'person.circle', symbolActive: 'person.circle.fill' },
];

type TabKey = 'index' | 'community' | 'profile';

type Props = {
  activeTab: TabKey | string;
  onTabPress: (key: TabKey) => void;
  onWritePress: () => void;
};

const PILL_H = 58;
const FAB_SIZE = 54;

export function TabBar({ activeTab, onTabPress, onWritePress }: Props) {
  const insets = useSafeAreaInsets();
  const fabScale = useSharedValue(1);

  const handleTabPress = useCallback(
    (key: TabKey) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabPress(key);
    },
    [onTabPress],
  );

  const handleFabPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onWritePress();
  }, [onWritePress]);

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  return (
    <View
      style={[styles.wrapper, { paddingBottom: insets.bottom + 10 }]}
      pointerEvents="box-none"
    >
      {/* Floating pill */}
      <View style={styles.pill}>
        {TABS.map((tab) => (
          <TabItem
            key={tab.key}
            tab={tab}
            active={activeTab === tab.key}
            onPress={() => handleTabPress(tab.key as TabKey)}
          />
        ))}
      </View>

      {/* Write FAB — white circle beside the pill */}
      <Pressable
        onPressIn={() => { fabScale.value = withSpring(0.88, { damping: 12 }); }}
        onPressOut={() => { fabScale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
        onPress={handleFabPress}
        accessibilityRole="button"
        accessibilityLabel="Open journal editor"
      >
        <Animated.View style={[styles.fab, fabAnimStyle]}>
          <Icon name="square.and.pencil" size={22} color={colors.text} weight="regular" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.82, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      style={[styles.tab, active && styles.tabActive]}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
    >
      <Animated.View style={iconStyle}>
        <Icon
          name={active ? tab.symbolActive : tab.symbol}
          size={22}
          color={active ? colors.accent : colors.secondaryLabel}
          weight={active ? 'semibold' : 'regular'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_H,
    backgroundColor: colors.pillBg,
    borderRadius: 999,
    padding: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    alignSelf: 'stretch',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.tile,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});

