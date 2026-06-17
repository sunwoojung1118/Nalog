import { useEffect, useState } from 'react';

// Returns a Date that updates every `intervalMs` (default 30s). Use 30s for
// minute-resolution clocks; avoid 1s — it would re-render the whole writer
// every second while the user is typing.
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
