import { create } from 'zustand';

/**
 * Ephemeral player session — NOT persisted. Lives only while the player is open.
 * Time math is derived from Date.now() each tick, so backgrounding the tab
 * doesn't lose time.
 */
type SessionStatus = 'idle' | 'playing' | 'paused' | 'completed';

type SessionState = {
  status: SessionStatus;
  stepIndex: number;
  stepStartedAt: number | null;
  pausedAt: number | null;
  accumulatedPauseMs: number;
  /** Total step count at the time the session started, captured for progress dots. */
  totalSteps: number;

  start: (totalSteps: number) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  advance: () => void;
  jumpTo: (targetIndex: number) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  stepIndex: 0,
  stepStartedAt: null,
  pausedAt: null,
  accumulatedPauseMs: 0,
  totalSteps: 0,

  start: (totalSteps) =>
    set({
      status: 'playing',
      stepIndex: 0,
      stepStartedAt: Date.now(),
      pausedAt: null,
      accumulatedPauseMs: 0,
      totalSteps,
    }),

  pause: () => {
    if (get().status !== 'playing') return;
    set({ status: 'paused', pausedAt: Date.now() });
  },

  resume: () => {
    const s = get();
    if (s.status !== 'paused' || s.pausedAt == null) return;
    const pauseDuration = Date.now() - s.pausedAt;
    set({
      status: 'playing',
      pausedAt: null,
      accumulatedPauseMs: s.accumulatedPauseMs + pauseDuration,
    });
  },

  skip: () => get().advance(),

  advance: () => {
    const s = get();
    const next = s.stepIndex + 1;
    if (next >= s.totalSteps) {
      set({ status: 'completed' });
      return;
    }
    set({
      stepIndex: next,
      stepStartedAt: Date.now(),
      pausedAt: null,
      accumulatedPauseMs: 0,
      // If we were paused when skipping, resume into the next step.
      status: 'playing',
    });
  },

  /**
   * Jump to `targetIndex`. The timeline is two-way now:
   *  - Forward: intermediate steps become "completed" (visually, by index).
   *  - Backward: re-opens an earlier step with a fresh timer; subsequent
   *    steps revert to "upcoming" because they sit after the new stepIndex.
   * `targetIndex >= totalSteps` completes the session.
   * `targetIndex < 0` clamps to 0.
   */
  jumpTo: (targetIndex) => {
    const s = get();
    if (targetIndex === s.stepIndex) return;
    if (targetIndex >= s.totalSteps) {
      set({ status: 'completed' });
      return;
    }
    const clamped = Math.max(0, targetIndex);
    set({
      stepIndex: clamped,
      stepStartedAt: Date.now(),
      pausedAt: null,
      accumulatedPauseMs: 0,
      status: 'playing',
    });
  },

  reset: () =>
    set({
      status: 'idle',
      stepIndex: 0,
      stepStartedAt: null,
      pausedAt: null,
      accumulatedPauseMs: 0,
      totalSteps: 0,
    }),
}));

/**
 * Returns ms remaining for the current step, given its duration in minutes.
 * Caller should compute on every tick so backgrounding stays accurate.
 */
export function remainingMs(
  status: SessionStatus,
  stepStartedAt: number | null,
  accumulatedPauseMs: number,
  pausedAt: number | null,
  stepMinutes: number,
  now: number,
): number {
  if (status === 'idle' || stepStartedAt == null) return stepMinutes * 60_000;
  const totalMs = stepMinutes * 60_000;
  const livePauseMs = status === 'paused' && pausedAt != null ? now - pausedAt : 0;
  const elapsed = now - stepStartedAt - accumulatedPauseMs - livePauseMs;
  return Math.max(0, totalMs - elapsed);
}
