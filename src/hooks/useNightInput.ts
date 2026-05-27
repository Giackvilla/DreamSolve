import { useEffect, useRef, useState } from 'react';
import { get, set as idbSet } from 'idb-keyval';

/**
 * Per-night input persistence in IndexedDB. Keyed by night-date + preset so
 * a user's worry/to-do/etc. for tonight survives reloads (and tab kills),
 * while next night starts fresh.
 *
 * `update` is fire-and-forget — writes are debounced 250ms so we don't hit
 * IDB on every keystroke. Reads happen once on mount.
 *
 * Storage shape: `dreamsolve:input:<nightDate>:<preset>` → JSON-clonable T.
 */
export function useNightInput<T>(
  preset: string,
  nightDate: string,
  initial: T,
): {
  value: T;
  setValue: (next: T) => void;
  loaded: boolean;
} {
  const key = `dreamsolve:input:${nightDate}:${preset}`;
  const [value, setValueState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Reset state when the key changes so stale data from the previous night
    // doesn't leak into a fresh form. (Edge case: a long-running session that
    // crosses bedtime — `nightOfKey(nextBedtime(now))` flips dates and the
    // key changes.)
    setLoaded(false);
    setValueState(initial);
    get<T>(key).then((stored) => {
      if (cancelled) return;
      if (stored !== undefined) setValueState(stored);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
    // `initial` intentionally omitted — callers pass a fresh literal each
    // render, so depending on it would cause an infinite reset loop. The
    // initial used here is the one that was passed when the key changed,
    // which is the right behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (next: T) => {
    setValueState(next);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      idbSet(key, next).catch(() => {
        // IDB can be unavailable in private mode; the in-memory value still works.
      });
    }, 250);
  };

  // Flush any pending debounced write on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        idbSet(key, valueRef.current!).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Keep the latest value in a ref so the unmount flush above writes the final value.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return { value, setValue, loaded };
}
