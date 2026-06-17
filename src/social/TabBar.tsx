import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
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

const ACTIVE_BLUE = '#1E63E8';

export function TabBar({ active, onChange, onNalog, onNalogLayout }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        {TABS.map((t) => (
          <Tab
            key={t.key}
            tabKey={t.key}
            label={t.label}
            isActive={active === t.key}
            onPress={() => onChange(t.key)}
          />
        ))}
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
        <View style={styles.nalogDot}>
          <Text style={styles.nalogLabel}>Nalog</Text>
          <View style={styles.nalogSweep} />
        </View>
      </Pressable>
    </View>
  );
}

function Tab({
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
    </Pressable>
  );
}

function Icon({ tabKey, isActive }: { tabKey: TabKey; isActive: boolean }) {
  const color = isActive && tabKey === 'home' ? ACTIVE_BLUE : colors.ink;
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
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT,
    backgroundColor: colors.paper,
    borderRadius: PILL_HEIGHT / 2,
    paddingHorizontal: spacing.sm,
    ...shadows.tile,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: PILL_HEIGHT - 12,
    gap: 6,
  },
  label: {
    fontFamily: fonts.serif,
    fontSize: 11,
    color: colors.inkSoft,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.ink,
    fontWeight: '700',
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
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.tile,
  },
  nalogLabel: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nalogSweep: {
    position: 'absolute',
    bottom: 10,
    width: 22,
    height: 12,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.amber,
    borderBottomRightRadius: 14,
    transform: [{ rotate: '-12deg' }],
  },
});
