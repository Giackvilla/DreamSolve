/**
 * Time helpers. We use Date.now() deltas everywhere instead of tick counting,
 * so timers survive tab backgrounding.
 */

/** Parse "HH:mm" into [hours, minutes]. */
export function parseHHMM(hhmm: string): [number, number] {
  const [h, m] = hhmm.split(':').map(Number);
  return [h ?? 0, m ?? 0];
}

/** Format a Date to "HH:mm". */
export function formatHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Returns the next occurrence of `hhmm` from `now` — same day if still upcoming,
 * otherwise tomorrow. This is the "bedtime" target we count down to.
 */
export function nextBedtime(hhmm: string, now: Date = new Date()): Date {
  const [h, m] = parseHHMM(hhmm);
  const t = new Date(now);
  t.setHours(h, m, 0, 0);
  if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
  return t;
}

/** Returns the wind-down start time = bedtime - leadMinutes. */
export function windDownStart(bedtime: Date, leadMinutes: number): Date {
  return new Date(bedtime.getTime() - leadMinutes * 60_000);
}

/** Format a millisecond duration as "Hh MMm" or "MMm SSs". Used for the countdown. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** ISO date string for the *night-of* — uses local date of the bedtime. */
export function nightOfKey(bedtime: Date): string {
  const y = bedtime.getFullYear();
  const m = String(bedtime.getMonth() + 1).padStart(2, '0');
  const d = String(bedtime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
