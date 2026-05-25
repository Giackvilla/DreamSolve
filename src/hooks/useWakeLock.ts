import { useEffect, useRef } from 'react';

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', cb: () => void) => void;
};

/**
 * Holds a Screen Wake Lock while `active` is true. Re-acquires automatically
 * if the page becomes visible again (the platform releases the lock on
 * backgrounding). Silent on browsers that don't support the API.
 *
 * Browser notes (per RESEARCH-P2-P3.md §2.1):
 *   - iOS Safari 16.4+ supports it; installed PWAs were broken until iOS 18.4.
 *   - Low-battery or user prefs can refuse the request — caller cannot tell.
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
    };
    if (!nav.wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      if (!active || cancelled || lockRef.current) return;
      try {
        const sentinel = await nav.wakeLock!.request('screen');
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        lockRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          if (lockRef.current === sentinel) lockRef.current = null;
        });
      } catch {
        // Refused (low battery, etc.) — silently degrade.
      }
    };

    const release = () => {
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active && !lockRef.current) {
        acquire();
      }
    };

    if (active) acquire();
    else release();

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      release();
    };
  }, [active]);
}
