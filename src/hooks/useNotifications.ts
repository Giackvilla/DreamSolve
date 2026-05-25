import { useEffect, useRef } from 'react';
import { nextBedtime, windDownStart } from '@/lib/time';

/**
 * Schedules two notifications per day while the app is alive:
 *   - T-60: "Wind-down starts now"
 *   - T-0:  "Lights out"
 *
 * Honest limitation (RESEARCH.md §5, RESEARCH-P2-P3.md §2.2):
 * Web platforms can't reliably schedule pings if the tab/SW dies.
 * For v1, this fires only while the app is loaded — installed as a PWA
 * and recently opened gives the best odds.
 *
 * We re-arm whenever bedtime or enabled state changes.
 */
export function useNotifications(opts: {
  enabled: boolean;
  bedtimeHHMM: string;
  windDownMinutes: number;
}) {
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    // Clear any previous timers (re-arm).
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    if (!opts.enabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const now = new Date();
    const bed = nextBedtime(opts.bedtimeHHMM, now);
    const wd = windDownStart(bed, opts.windDownMinutes);

    const schedule = (when: Date, title: string, body: string, tag: string) => {
      const delay = when.getTime() - now.getTime();
      if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return; // sanity bounds
      const id = window.setTimeout(() => {
        try {
          new Notification(title, {
            body,
            tag,
            icon: '/icon-192.svg',
            silent: false,
          });
        } catch {
          // Some browsers throw if called outside a user gesture context after a long delay.
        }
      }, delay);
      timersRef.current.push(id);
    };

    schedule(wd, 'Wind-down starts now', 'Time to begin tonight’s routine.', 'dreamsolve-wd');
    schedule(bed, 'Lights out', 'Goodnight — see you in the morning.', 'dreamsolve-bed');

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [opts.enabled, opts.bedtimeHHMM, opts.windDownMinutes]);
}

/**
 * One-shot permission request. Returns the resulting permission state.
 * Must be called from a user-gesture handler (button click) — browser rule.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return await Notification.requestPermission();
}
