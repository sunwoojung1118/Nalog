import { useCallback, useEffect, useRef, useState } from 'react';
import { readDraft, saveDraft } from '@/lib/draft';

type SaveState = 'idle' | 'saving' | 'saved';

export function useWeekDraft(year: number, week: number) {
  const [title, setTitleRaw] = useState('');
  const [body, setBodyRaw] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [hydrated, setHydrated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef('');
  const bodyRef = useRef('');

  useEffect(() => {
    readDraft(year, week).then((d) => {
      titleRef.current = d.title;
      bodyRef.current = d.body;
      setTitleRaw(d.title);
      setBodyRaw(d.body);
      setHydrated(true);
    });
  }, [year, week]);

  const persist = useCallback(
    (nextTitle: string, nextBody: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveState('saving');
      debounceRef.current = setTimeout(async () => {
        await saveDraft(year, week, nextTitle, nextBody);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1500);
      }, 800);
    },
    [year, week],
  );

  const setTitle = useCallback(
    (v: string) => {
      titleRef.current = v;
      setTitleRaw(v);
      persist(v, bodyRef.current);
    },
    [persist],
  );

  const setBody = useCallback(
    (v: string) => {
      bodyRef.current = v;
      setBodyRaw(v);
      persist(titleRef.current, v);
    },
    [persist],
  );

  return { title, setTitle, body, setBody, saveState, hydrated };
}
