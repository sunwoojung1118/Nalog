import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/theme';
import { useSheetSnap } from '@/components/SheetStateContext';

export function ProfileHeaderActions() {
  const router = useRouter();
  const { requestSnap } = useSheetSnap();

  const onPlus = () => {
    Alert.alert('Create', 'What would you like to write?', [
      { text: 'New Nalog', onPress: () => requestSnap('full') },
      { text: 'New Log', onPress: () => router.push('/log/new' as never) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPlus}
        hitSlop={12}
        accessibilityLabel="Create a new entry"
        style={styles.button}
      >
        <Text style={styles.plus}>+</Text>
      </Pressable>
      <View style={{ flex: 1 }} />
      <Pressable
        onPress={() => router.push('/settings' as never)}
        hitSlop={12}
        accessibilityLabel="Open settings"
        style={styles.button}
      >
        <Text style={styles.gear}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
    lineHeight: 30,
  },
  gear: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.inkSoft,
  },
});
