import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  ms: number,
): [debouncedFn: (...args: T) => void, cancel: () => void] {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: T) => {
      cancel();
      timerRef.current = setTimeout(() => fnRef.current(...args), ms);
    },
    [cancel, ms],
  );

  useEffect(() => cancel, [cancel]);

  return [debounced, cancel];
}
