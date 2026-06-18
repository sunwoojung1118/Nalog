import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { Avatar } from '@/social/components/Avatar';
import { ProfileHeaderActions } from '@/social/components/ProfileHeaderActions';
import { PastWeek, profileInitials, useMyProfile, usePastWeeks } from '@/social/data/social-store';
import { DayEntry } from '@/components/DayEntry';
import { DayIndex } from '@/lib/date';
import { MetricEntry, WeekHabit, readWeekCache } from '@/lib/weekStore';

type Props = { contentBottomPadding: number };

export function ProfileTab({ contentBottomPadding }: Props) {
  const profile = useMyProfile();
  const past = usePastWeeks();
  const [openWeek, setOpenWeek] = useState<PastWeek | null>(null);

  if (openWeek) {
    return (
      <WeekViewer
        week={openWeek}
        onBack={() => setOpenWeek(null)}
        contentBottomPadding={contentBottomPadding}
      />
    );
  }

  const initials = profileInitials(profile.name);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeaderActions />
      <View style={styles.identity}>
        <Avatar initials={initials} size={64} />
        <TextInput
          value={profile.name}
          onChangeText={profile.onChangeName}
          placeholder="Your name"
          placeholderTextColor={colors.textFaint}
          style={styles.name}
          selectionColor={colors.accent}
        />
        <TextInput
          value={profile.bio}
          onChangeText={profile.onChangeBio}
          placeholder="A line about you"
          placeholderTextColor={colors.textFaint}
          style={styles.bio}
          selectionColor={colors.accent}
          multiline
        />
      </View>

      <Text style={styles.sectionTitle}>Your weeks</Text>
      {!past.hydrated ? null : past.weeks.length === 0 ? (
        <Text style={styles.emptyLine}>You haven{`'`}t written yet. Tap the bar to begin.</Text>
      ) : (
        past.weeks.map((w) => (
          <Pressable
            key={`${w.year}-${w.week}`}
            onPress={() => setOpenWeek(w)}
            style={styles.weekRow}
          >
            <Text style={styles.weekNum}>{`w${w.week}`}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.weekTitle} numberOfLines={1}>
                {w.title || 'Untitled week'}
              </Text>
              <Text style={styles.weekMeta}>{`${w.daysWritten} day${w.daysWritten === 1 ? '' : 's'} written`}</Text>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

type ViewerEntry = {
  day: DayIndex;
  subtitle: string;
  blocks: import('@/lib/blocks').Block[];
  metrics: MetricEntry[];
  habitChecks: Record<string, boolean>;
};

function WeekViewer({
  week,
  onBack,
  contentBottomPadding,
}: {
  week: PastWeek;
  onBack: () => void;
  contentBottomPadding: number;
}) {
  const [entries, setEntries] = useState<ViewerEntry[]>([]);
  const [habits, setHabits] = useState<WeekHabit[]>([]);
  useEffect(() => {
    const load = async () => {
      const draft = await readWeekCache(week.year, week.week);
      if (!draft) {
        setEntries([]);
        setHabits([]);
        return;
      }
      const days: DayIndex[] = [1, 2, 3, 4, 5, 6, 7];
      const resolved: ViewerEntry[] = days.map((d) => ({
        day: d,
        subtitle: draft.days[d].subtitle,
        blocks: draft.days[d].blocks,
        metrics: draft.days[d].metrics,
        habitChecks: draft.days[d].habitChecks,
      }));
      const pairs = resolved.filter(
        (p) =>
          p.subtitle ||
          p.blocks.length > 0 ||
          p.metrics.length > 0 ||
          Object.keys(p.habitChecks).length > 0,
      );
      setEntries(pairs);
      setHabits(draft.habits);
    };
    load();
  }, [week.year, week.week]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.viewerHeader}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>← Your weeks</Text>
        </Pressable>
        <Text style={styles.viewerWeekNum}>{`w${week.week}`}</Text>
        <Text style={styles.viewerTitle}>{week.title || 'Untitled week'}</Text>
      </View>
      <View style={{ paddingHorizontal: spacing.lg }}>
        {entries.map((e) => (
          <DayEntry
            key={`v-${week.year}-${week.week}-${e.day}`}
            week={week.week}
            dayIndex={e.day}
            subtitle={e.subtitle}
            blocks={e.blocks}
            metrics={e.metrics}
            habitChecks={e.habitChecks}
            weekHabits={habits}
            readOnly
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: spacing.lg },
  identity: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 2,
    minWidth: 120,
  },
  bio: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.textSoft,
    textAlign: 'center',
    paddingVertical: 2,
    maxWidth: 320,
  },
  sectionTitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textFaint,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyLine: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.textFaint,
    paddingHorizontal: spacing.lg,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  weekNum: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent,
    width: 48,
  },
  weekTitle: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.text,
  },
  weekMeta: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 2,
  },
  viewerHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  back: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: spacing.sm,
  },
  viewerWeekNum: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent,
  },
  viewerTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.text,
  },
});
