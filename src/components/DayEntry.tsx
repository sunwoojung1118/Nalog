import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { DayIndex, dayName } from '@/lib/date';

type Props = {
  dayIndex: number;
  subtitle: string;
  body: string;
  onChangeSubtitle?: (v: string) => void;
  onChangeBody?: (v: string) => void;
  readOnly?: boolean;
  bodyPlaceholder?: string;
  subtitlePlaceholder?: string;
};

export function DayEntry({
  dayIndex,
  subtitle,
  body,
  onChangeSubtitle,
  onChangeBody,
  readOnly = false,
  bodyPlaceholder,
  subtitlePlaceholder,
}: Props) {
  const label =
    dayIndex >= 1 && dayIndex <= 7 ? dayName(dayIndex as DayIndex) : '';

  return (
    <View style={[styles.wrap, readOnly && styles.readOnlyWrap]}>
      <View style={styles.row}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          value={subtitle}
          onChangeText={onChangeSubtitle}
          editable={!readOnly}
          placeholder={subtitlePlaceholder ?? (readOnly ? '' : 'Today, in one line')}
          placeholderTextColor={colors.inkFaint}
          style={styles.subtitle}
          selectionColor={colors.amber}
        />
      </View>
      <TextInput
        value={body}
        onChangeText={onChangeBody}
        editable={!readOnly}
        multiline
        scrollEnabled={false}
        placeholder={
          bodyPlaceholder ??
          (readOnly
            ? ''
            : 'Start writing your day right here. No filters, no performance pressure...')
        }
        placeholderTextColor={colors.inkFaint}
        style={[styles.body, readOnly && styles.bodyReadOnly]}
        selectionColor={colors.amber}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  readOnlyWrap: {
    opacity: 0.55,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.inkFaint,
    letterSpacing: 0.6,
    textTransform: 'lowercase',
  },
  subtitle: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
    paddingVertical: 2,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: 17,
    lineHeight: 28,
    color: colors.ink,
    minHeight: 180,
    paddingTop: spacing.sm,
  },
  bodyReadOnly: {
    minHeight: 0,
  },
});
