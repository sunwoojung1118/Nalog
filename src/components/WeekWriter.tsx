import React, { useCallback, useMemo, useRef } from 'react';
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, fonts, spacing } from '@/constants/theme';
import { SaveState, useAutoSavedField } from '@/hooks/useAutoSavedField';
import { DayIndex, dayName, storageKey } from '@/lib/date';
import { DayEntry } from './DayEntry';
import { useWriterState } from './WriterStateProvider';
import { WriterHeader } from './writer/WriterHeader';
import { PastWeekAffordance } from './writer/PastWeekAffordance';
import { useSheetSnap } from './SheetStateContext';

function metaLabel(state: SaveState): string {
  if (state === 'saving') return 'Saving...';
  if (state === 'saved') return 'All changes saved';
  return ' ';
}

const OVERSCROLL_THRESHOLD = 64;

type PriorDayProps = {
  week: number;
  day: DayIndex;
  scrollY: SharedValue<number>;
  initialized: SharedValue<boolean>;
};

function PriorDay({ week, day, scrollY, initialized }: PriorDayProps) {
  const subtitle = useAutoSavedField(storageKey(week, day, 'subtitle'));
  const body = useAutoSavedField(storageKey(week, day, 'body'));
  const itemY = useSharedValue(0);
  const itemH = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      itemY.value = e.nativeEvent.layout.y;
      itemH.value = e.nativeEvent.layout.height;
    },
    [itemY, itemH],
  );

  const style = useAnimatedStyle(() => {
    if (!initialized.value || itemH.value === 0) {
      return {
        opacity: 0,
        transform: [{ scale: 0.92 }, { translateY: 12 }],
      };
    }
    const h = itemH.value;
    const itemBottomRelTop = itemY.value + h - scrollY.value;
    const progress = interpolate(
      itemBottomRelTop,
      [0, h],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      transform: [
        { scale: interpolate(progress, [0, 1], [0.92, 1]) },
        { translateY: interpolate(progress, [0, 1], [12, 0]) },
      ],
    };
  });

  if (!subtitle.hydrated || !body.hydrated) return null;
  const empty = !subtitle.value && !body.value;
  return (
    <Animated.View onLayout={onLayout} style={style}>
      {empty ? (
        <View style={styles.priorEmpty}>
          <Text style={styles.priorEmptyText}>{`${dayName(day)} — not written`}</Text>
        </View>
      ) : (
        <DayEntry dayIndex={day} subtitle={subtitle.value} body={body.value} readOnly />
      )}
    </Animated.View>
  );
}

export function WeekWriter() {
  const { week, today, title, todaySubtitle, todayBody, combinedSaveState } = useWriterState();
  const { requestSnap } = useSheetSnap();

  const priorDays = useMemo(
    () => Array.from({ length: today - 1 }, (_, i) => (i + 1) as DayIndex),
    [today],
  );

  const scrollRef = useRef<ScrollView>(null);
  const didInitialScroll = useRef(false);
  const popTriggered = useRef(false);

  const scrollY = useSharedValue(0);
  const initialized = useSharedValue(false);

  const onContentSizeChange = () => {
    if (didInitialScroll.current) return;
    didInitialScroll.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
      initialized.value = true;
    });
  };

  const popFeed = useCallback(() => {
    if (popTriggered.current) return;
    popTriggered.current = true;
    requestSnap('bar');
    // Allow another pop after the user re-opens the sheet.
    setTimeout(() => {
      popTriggered.current = false;
    }, 600);
  }, [requestSnap]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      const overscroll =
        e.contentOffset.y + e.layoutMeasurement.height - e.contentSize.height;
      if (overscroll > OVERSCROLL_THRESHOLD) {
        runOnJS(popFeed)();
      }
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <WriterHeader />

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{metaLabel(combinedSaveState)}</Text>
      </View>

      <View style={styles.weekHeader}>
        <TextInput
          value={title.value}
          onChangeText={title.onChange}
          placeholder="Title"
          placeholderTextColor={colors.inkFaint}
          style={styles.weekTitle}
          selectionColor={colors.amber}
        />
        {!title.value ? (
          <Text style={styles.weekTitleHelper}>Start your Nalog</Text>
        ) : null}
      </View>
      <View style={styles.divider} />

      <Animated.ScrollView
        ref={scrollRef as unknown as React.RefObject<Animated.ScrollView>}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {priorDays.map((d) => (
          <PriorDay
            key={`prior-${week}-${d}`}
            week={week}
            day={d}
            scrollY={scrollY}
            initialized={initialized}
          />
        ))}
        <DayEntry
          dayIndex={today}
          subtitle={todaySubtitle.value}
          body={todayBody.value}
          onChangeSubtitle={todaySubtitle.onChange}
          onChangeBody={todayBody.onChange}
        />
        <PastWeekAffordance onActivate={popFeed} />
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  metaRow: {
    alignItems: 'flex-end',
    height: 18,
    marginBottom: spacing.xs,
  },
  metaText: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.inkFaint,
    letterSpacing: 0.2,
  },
  weekHeader: {
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  weekTitle: {
    fontFamily: fonts.serif,
    fontSize: 34,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.2,
    paddingVertical: 2,
  },
  weekTitleHelper: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.inkFaint,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  priorEmpty: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    marginBottom: spacing.sm,
  },
  priorEmptyText: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.inkFaint,
  },
});
