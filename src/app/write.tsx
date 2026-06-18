import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/theme';
import { WeekWriter } from '@/components/WeekWriter';
import { WriterStateProvider } from '@/components/WriterStateProvider';

export default function WriteScreen() {
  const insets = useSafeAreaInsets();
  return (
    <WriterStateProvider>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={10}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Close writer"
          >
            <Text style={styles.backText}>← Home</Text>
          </Pressable>
        </View>
        <WeekWriter />
      </View>
    </WriterStateProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  backText: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: '600',
  },
});
