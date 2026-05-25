import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BedtimeSettings, NightLogEntry, RoutineStep } from './types';
import { DEFAULT_ROUTINE, DEFAULT_SETTINGS } from './defaults';

type AppState = {
  settings: BedtimeSettings;
  routine: RoutineStep[];
  log: NightLogEntry[];

  setBedtime: (hhmm: string) => void;
  setWeekendsDifferent: (on: boolean) => void;
  setWeekendBedtime: (hhmm: string) => void;
  setNotificationsEnabled: (on: boolean) => void;

  addStep: (step: Omit<RoutineStep, 'id'>) => void;
  updateStep: (id: string, patch: Partial<Omit<RoutineStep, 'id'>>) => void;
  removeStep: (id: string) => void;
  reorderSteps: (ids: string[]) => void;
  resetRoutine: () => void;

  logNight: (date: string, completed: boolean) => void;
};

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      routine: DEFAULT_ROUTINE,
      log: [],

      setBedtime: (hhmm) =>
        set((s) => ({ settings: { ...s.settings, defaultBedtime: hhmm } })),
      setWeekendsDifferent: (on) =>
        set((s) => ({ settings: { ...s.settings, weekendsDifferent: on } })),
      setWeekendBedtime: (hhmm) =>
        set((s) => ({ settings: { ...s.settings, weekendBedtime: hhmm } })),
      setNotificationsEnabled: (on) =>
        set((s) => ({ settings: { ...s.settings, notificationsEnabled: on } })),

      addStep: (step) =>
        set((s) => ({ routine: [...s.routine, { ...step, id: newId() }] })),
      updateStep: (id, patch) =>
        set((s) => ({
          routine: s.routine.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeStep: (id) =>
        set((s) => ({ routine: s.routine.filter((r) => r.id !== id) })),
      reorderSteps: (ids) =>
        set((s) => {
          const byId = new Map(s.routine.map((r) => [r.id, r]));
          return { routine: ids.map((i) => byId.get(i)!).filter(Boolean) };
        }),
      resetRoutine: () => set({ routine: DEFAULT_ROUTINE }),

      logNight: (date, completed) =>
        set((s) => {
          const without = s.log.filter((e) => e.date !== date);
          return { log: [...without, { date, completed }].slice(-90) };
        }),
    }),
    {
      name: 'dreamsolve:v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

/** Selector: total routine minutes. */
export const selectRoutineMinutes = (s: AppState) =>
  s.routine.reduce((acc, r) => acc + r.minutes, 0);

/** Selector: bedtime HH:mm for a given Date (handles weekends-different toggle). */
export const selectBedtimeFor = (s: AppState, d: Date): string => {
  const day = d.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6;
  return s.settings.weekendsDifferent && isWeekend
    ? s.settings.weekendBedtime
    : s.settings.defaultBedtime;
};
