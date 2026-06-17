import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { SaveState } from '@/hooks/useAutoSavedField';
import { useSheetSnap } from '@/components/SheetStateContext';
import { useWriterState } from '@/components/WriterStateProvider';
import { BAR_HEIGHT } from '@/lib/useBarFootprint';
import { formatBarDate } from '@/lib/formatDate';

function saveLabel(state: SaveState): string {
  if (state === 'saving') return 'Saving...';
  if (state === 'saved') return 'All changes saved';
  return '';
}

export function SheetBar() {
  const { snap } = useSheetSnap();
  const { combinedSaveState } = useWriterState();
  const [now, setNow] = useState(() => new Date());
  const showLabel = snap === 'bar';
  const status = showLabel ? saveLabel(combinedSaveState) : '';

  useEffect(() => {
    if (!showLabel) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [showLabel]);

  return (
    <View style={styles.wrap}>
      <View style={styles.handle} />
      {showLabel && (
        <View style={styles.row}>
          <Text style={styles.tag} numberOfLines={1}>
            {`${formatBarDate(now)}  ·  Tap to write`}
          </Text>
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: BAR_HEIGHT,
    paddingTop: 8,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.handle,
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  tag: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.inkSoft,
    letterSpacing: 0.4,
  },
  status: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.inkFaint,
  },
});
