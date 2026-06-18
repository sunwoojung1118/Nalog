import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { Block } from '@/lib/blocks';
import { DayIndex, dayLabel, dayName } from '@/lib/date';
import { MetricEntry, WeekHabit } from '@/lib/weekStore';
import { DayHabitsRow } from './writer/DayHabitsRow';
import { DocEditor } from './writer/DocEditor';
import { MetricsSection } from './writer/MetricsSection';

type Props = {
  week: number;
  dayIndex: DayIndex;
  subtitle: string;
  blocks: Block[];
  metrics: MetricEntry[];
  habitChecks: Record<string, boolean>;
  weekHabits: WeekHabit[];
  onChangeSubtitle?: (v: string) => void;
  onChangeBlocks?: (next: Block[]) => void;
  onChangeMetrics?: (next: MetricEntry[]) => void;
  onChangeHabitChecks?: (next: Record<string, boolean>) => void;
  allocateImagePath?: () => string;
  onOpenHabitsEditor?: () => void;
  readOnly?: boolean;
  bodyPlaceholder?: string;
  subtitlePlaceholder?: string;
};

export function DayEntry({
  week,
  dayIndex,
  subtitle,
  blocks,
  metrics,
  habitChecks,
  weekHabits,
  onChangeSubtitle,
  onChangeBlocks,
  onChangeMetrics,
  onChangeHabitChecks,
  allocateImagePath,
  onOpenHabitsEditor,
  readOnly = false,
  bodyPlaceholder,
  subtitlePlaceholder,
}: Props) {
  return (
    <View style={[styles.card, readOnly && styles.readOnly]}>
      <View style={styles.headRow}>
        <Text style={styles.dayLabel} accessibilityLabel={`${dayName(dayIndex)} entry`}>
          {dayLabel(week, dayIndex)}
        </Text>
        <TextInput
          value={subtitle}
          onChangeText={onChangeSubtitle}
          editable={!readOnly}
          placeholder={subtitlePlaceholder ?? (readOnly ? '' : 'Today, in one line')}
          placeholderTextColor={colors.inkFaint}
          style={styles.subtitle}
          selectionColor={colors.accent}
        />
      </View>

      <DocEditor
        blocks={blocks}
        onChange={onChangeBlocks ?? (() => {})}
        readOnly={readOnly}
        placeholder={
          bodyPlaceholder ??
          'Write your day. Highlight a passage to mark it Private — others won&rsquo;t see it.'
        }
        allocateImagePath={allocateImagePath}
      />

      <DayHabitsRow
        habits={weekHabits}
        checks={habitChecks}
        onChange={onChangeHabitChecks}
        readOnly={readOnly}
        onOpenEditor={onOpenHabitsEditor}
      />

      <MetricsSection metrics={metrics} onChange={onChangeMetrics} readOnly={readOnly} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassElevated,
    borderRadius: radius.tile,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  readOnly: {
    opacity: 0.78,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  dayLabel: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.accent,
    letterSpacing: 0.4,
  },
  subtitle: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 2,
  },
});
