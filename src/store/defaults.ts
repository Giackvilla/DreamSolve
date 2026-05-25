import type { BedtimeSettings, RoutineStep } from './types';

export const DEFAULT_SETTINGS: BedtimeSettings = {
  defaultBedtime: '22:30',
  weekendsDifferent: false,
  weekendBedtime: '23:30',
  windDownMinutes: 60,
  notificationsEnabled: true,
};

/**
 * Seeded routine so the empty state is a working routine, not a blank slate.
 * Sums to 60 min. Derived from Sleep Foundation / Headspace / RISE guidance.
 */
export const DEFAULT_ROUTINE: RoutineStep[] = [
  { id: 'r1', title: 'Tidy up · set out tomorrow', minutes: 10, icon: 'sparkles' },
  { id: 'r2', title: 'Dim lights · phone on charger', minutes: 5, icon: 'lamp' },
  { id: 'r3', title: 'Shower · skincare', minutes: 15, icon: 'droplets' },
  { id: 'r4', title: 'Stretch · light yoga', minutes: 10, icon: 'activity' },
  { id: 'r5', title: 'Read or journal', minutes: 10, icon: 'book-open' },
  { id: 'r6', title: 'Breathing (4-7-8)', minutes: 10, icon: 'wind' },
];
