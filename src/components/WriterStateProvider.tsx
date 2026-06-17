import { createContext, ReactNode, useContext, useMemo } from 'react';
import { combineSaveStates, SaveState, useAutoSavedField } from '@/hooks/useAutoSavedField';
import { useCurrentDate } from '@/lib/useCurrentDate';
import { DayIndex, storageKey, weekTitleKey } from '@/lib/date';

type Field = {
  value: string;
  onChange: (next: string) => void;
  hydrated: boolean;
  saveState: SaveState;
};

type WriterState = {
  week: number;
  today: DayIndex;
  title: Field;
  todaySubtitle: Field;
  todayBody: Field;
  combinedSaveState: SaveState;
};

const WriterStateContext = createContext<WriterState | null>(null);

export function WriterStateProvider({ children }: { children: ReactNode }) {
  const { week, today } = useCurrentDate();
  const title = useAutoSavedField(weekTitleKey(week));
  const todaySubtitle = useAutoSavedField(storageKey(week, today, 'subtitle'));
  const todayBody = useAutoSavedField(storageKey(week, today, 'body'));

  const combined = combineSaveStates([
    title.saveState,
    todaySubtitle.saveState,
    todayBody.saveState,
  ]);

  const value = useMemo<WriterState>(
    () => ({
      week,
      today,
      title,
      todaySubtitle,
      todayBody,
      combinedSaveState: combined,
    }),
    [week, today, title, todaySubtitle, todayBody, combined],
  );

  return <WriterStateContext.Provider value={value}>{children}</WriterStateContext.Provider>;
}

export function useWriterState(): WriterState {
  const v = useContext(WriterStateContext);
  if (!v) throw new Error('useWriterState must be used inside WriterStateProvider');
  return v;
}
