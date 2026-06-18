import { BlurView } from 'expo-blur';
import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { usePublishMode } from '@/social/data/social-store';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, setMode, hydrated } = usePublishMode();
  const isAuto = mode === 'auto';

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.rowWrap}>
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.rowOverlay]} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Auto-publish on Sunday</Text>
            <Text style={styles.rowSub}>
              Auto-publishes when the app next opens after Sunday. Turn off to publish manually.
            </Text>
          </View>
          <Switch
            value={isAuto}
            onValueChange={(v) => setMode(v ? 'auto' : 'manual')}
            disabled={!hydrated}
            trackColor={{ false: colors.handle, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  back: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.textSoft,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  rowWrap: {
    borderRadius: radius.card + 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  rowOverlay: {
    backgroundColor: 'rgba(10,10,15,0.45)',
    borderRadius: radius.card + 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowSub: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textSoft,
    lineHeight: 18,
  },
});
