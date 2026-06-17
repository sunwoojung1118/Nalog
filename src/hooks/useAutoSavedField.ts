import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved';

const DEBOUNCE_MS = 800;

export function useAutoSavedField(key: string) {
  const [value, setValue] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key).then((stored) => {
      if (cancelled) return;
      if (stored != null) setValue(stored);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const onChange = useCallback(
    (next: string) => {
      setValue(next);
      setSaveState('saving');
      if (timer.current) clearTimeout(timer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      timer.current = setTimeout(() => {
        AsyncStorage.setItem(key, next).finally(() => {
          setSaveState('saved');
          settleTimer.current = setTimeout(() => setSaveState('idle'), 2000);
        });
      }, DEBOUNCE_MS);
    },
    [key],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    [],
  );

  return { value, onChange, hydrated, saveState } as const;
}

// Combines multiple field save-states into a single panel-wide state.
export function combineSaveStates(states: SaveState[]): SaveState {
  if (states.some((s) => s === 'saving')) return 'saving';
  if (states.some((s) => s === 'saved')) return 'saved';
  return 'idle';
}
