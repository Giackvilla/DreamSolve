/**
 * Optional `practice` payload on a step. When undefined the player renders
 * the v1 generic countdown — backwards-compatible by design. See FUTURE.md
 * for the architectural overview.
 */
export type Practice =
  | { kind: 'breathing'; pattern: 'cyclic-sigh' | 'coherent' | 'box' | '4-7-8' }
  | { kind: 'shuffle' }
  | { kind: 'input'; preset: 'worry' | 'todo' | 'gratitude' };

export type RoutineStep = {
  id: string;
  title: string;
  minutes: number;
  icon?: string;
  practice?: Practice;
};

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type BedtimeSettings = {
  /** HH:mm — default bedtime applied when no per-day override is set. */
  defaultBedtime: string;
  /** When true, weekends (sat/sun) use weekendBedtime; otherwise defaultBedtime applies everywhere. */
  weekendsDifferent: boolean;
  weekendBedtime: string;
  /** Minutes before bedtime the wind-down routine kicks in. Locked to 60 in v1; slider in v2. */
  windDownMinutes: number;
  notificationsEnabled: boolean;
};

export type NightLogEntry = {
  /** ISO date of the *night-of* (the bedtime calendar date). */
  date: string;
  completed: boolean;
};
