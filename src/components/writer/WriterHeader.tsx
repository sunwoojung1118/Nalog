import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatWriterHeader } from '@/lib/formatDate';
import { useNow } from '@/hooks/useNow';

export function WriterHeader() {
  const now = useNow();
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{formatWriterHeader(now)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  text: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.4,
  },
});
