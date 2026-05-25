import { useEffect, useState } from 'react';

/**
 * Returns the current time, updated every `intervalMs`.
 * Used by the home countdown and the wind-down trigger.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
