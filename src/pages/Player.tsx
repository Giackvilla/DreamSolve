import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Pause, Play as PlayIcon, SkipForward, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { remainingMs, useSessionStore } from '@/store/useSessionStore';
import { useNow } from '@/hooks/useNow';
import { useWakeLock } from '@/hooks/useWakeLock';
import { formatCountdown, nextBedtime } from '@/lib/time';
import { BreathingCircle } from '@/components/BreathingCircle';
import { StepIcon } from '@/lib/icons';
import type { RoutineStep } from '@/store/types';

export default function Player() {
  const navigate = useNavigate();
  const routine = useAppStore((s) => s.routine);
  const bedtime = useAppStore((s) => s.settings.defaultBedtime);

  const session = useSessionStore();
  const now = useNow(250);

  // Start the session on mount if idle, abort/cleanup on unmount.
  useEffect(() => {
    if (session.status === 'idle' && routine.length > 0) {
      session.start(routine.length);
    }
    return () => {
      if (useSessionStore.getState().status !== 'completed') {
        useSessionStore.getState().reset();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = routine[session.stepIndex];

  // Tick: when remaining hits 0, advance.
  useEffect(() => {
    if (!step || session.status !== 'playing') return;
    const remaining = remainingMs(
      session.status,
      session.stepStartedAt,
      session.accumulatedPauseMs,
      session.pausedAt,
      step.minutes,
      now.getTime(),
    );
    if (remaining <= 0) {
      session.advance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, step, session.status, session.stepIndex]);

  // On completion, go to /bedtime.
  useEffect(() => {
    if (session.status === 'completed') {
      navigate('/bedtime', { replace: true });
    }
  }, [session.status, navigate]);

  useWakeLock(session.status === 'playing');

  if (!step) {
    return (
      <section className="min-h-[100dvh] flex flex-col items-center justify-center bg-night-950 px-6 text-center">
        <p className="text-night-300">Your routine has no steps.</p>
        <button onClick={() => navigate('/editor')} className="mt-6 text-moon-300 underline">
          Open editor
        </button>
      </section>
    );
  }

  const remaining = remainingMs(
    session.status,
    session.stepStartedAt,
    session.accumulatedPauseMs,
    session.pausedAt,
    step.minutes,
    now.getTime(),
  );
  const pct = 1 - remaining / (step.minutes * 60_000);
  const totalSteps = session.totalSteps || routine.length;
  const isBreathing = /breath/i.test(step.title);
  const paused = session.status === 'paused';

  // Routine time left = remaining in current step + sum of all upcoming steps.
  const routineMsLeft =
    remaining +
    routine.slice(session.stepIndex + 1).reduce((acc, s) => acc + s.minutes * 60_000, 0);

  // Wall-clock minutes-to-bed.
  const bed = useMemo(() => nextBedtime(bedtime, now), [bedtime, now]);
  const minutesToBed = Math.max(0, Math.round((bed.getTime() - now.getTime()) / 60_000));

  return (
    <section className="relative min-h-[100dvh] flex flex-col bg-night-950 text-night-50 overflow-hidden">
      {isBreathing && <BreathingCircle paused={paused} />}

      {/* Top bar */}
      <div
        className="relative z-10 flex items-center justify-between px-5 pt-5"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
      >
        <button
          aria-label="Close player"
          onClick={() => navigate('/')}
          className="p-2 -ml-2 text-night-500 hover:text-night-200 transition"
        >
          <X size={20} />
        </button>
        <ProgressDots total={totalSteps} index={session.stepIndex} />
        <div className="text-xs text-night-500 tabular-nums w-10 text-right">
          {session.stepIndex + 1}/{totalSteps}
        </div>
      </div>

      {/* Hero: title + countdown */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center mt-4">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          {!isBreathing && (
            <div className="w-12 h-12 rounded-full bg-night-800/80 border border-night-700 grid place-items-center text-moon-300 mb-3">
              <StepIcon iconKey={step.icon} size={20} />
            </div>
          )}
          <h1 className="text-xl font-light max-w-xs">{step.title}</h1>
          <div className="mt-4 text-6xl sm:text-7xl font-light tabular-nums">
            {formatCountdown(remaining)}
          </div>
        </motion.div>

        <div className="mt-4 w-56 h-1 rounded-full bg-night-700 overflow-hidden">
          <div
            className="h-full bg-moon-500 transition-[width] duration-200 ease-linear"
            style={{ width: `${Math.min(100, pct * 100)}%` }}
          />
        </div>
      </div>

      {/* Step checklist */}
      <div className="relative z-10 mt-6 px-5">
        <div className="max-w-md mx-auto">
          <ul className="rounded-2xl border border-night-700/70 bg-night-900/60 backdrop-blur-sm divide-y divide-night-800/80 overflow-hidden">
            {routine.map((s, i) => (
              <StepListRow
                key={s.id}
                step={s}
                index={i}
                state={
                  i < session.stepIndex
                    ? 'completed'
                    : i === session.stepIndex
                      ? 'current'
                      : 'upcoming'
                }
                onTap={() => {
                  if (i === session.stepIndex) {
                    session.advance(); // "check off" current = skip
                  } else if (i > session.stepIndex) {
                    session.jumpTo(i); // jump forward to this step
                  }
                  // completed rows: no-op (one-way timeline)
                }}
              />
            ))}
          </ul>
          <div className="mt-2 px-1 flex items-center justify-between text-xs text-night-500">
            <span className="tabular-nums">
              {formatCountdown(routineMsLeft)} left in routine
            </span>
            <span className="tabular-nums">{minutesToBed}m to lights out</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="relative z-10 mt-6 px-6 pb-6 flex items-center justify-center gap-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        <button
          onClick={() => (paused ? session.resume() : session.pause())}
          className="px-6 py-3 rounded-full bg-night-800/80 border border-night-700 hover:bg-night-700 transition flex items-center gap-2 text-sm"
        >
          {paused ? <PlayIcon size={16} fill="currentColor" /> : <Pause size={16} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={() => session.skip()}
          className="px-6 py-3 rounded-full bg-moon-500 text-night-950 font-medium shadow-lg shadow-moon-500/30 hover:bg-moon-400 transition flex items-center gap-2 text-sm"
        >
          <SkipForward size={16} fill="currentColor" />
          {session.stepIndex + 1 === totalSteps ? 'Finish' : 'Skip'}
        </button>
      </div>
    </section>
  );
}

function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`block rounded-full transition-all ${
            i < index
              ? 'w-1.5 h-1.5 bg-moon-400'
              : i === index
                ? 'w-4 h-1.5 bg-moon-300'
                : 'w-1.5 h-1.5 bg-night-600'
          }`}
        />
      ))}
    </div>
  );
}

type RowState = 'completed' | 'current' | 'upcoming';

function StepListRow({
  step,
  index,
  state,
  onTap,
}: {
  step: RoutineStep;
  index: number;
  state: RowState;
  onTap: () => void;
}) {
  const isTappable = state !== 'completed';
  return (
    <li>
      <button
        type="button"
        onClick={onTap}
        disabled={!isTappable}
        aria-label={
          state === 'current'
            ? `Mark step ${index + 1} done`
            : state === 'upcoming'
              ? `Jump to step ${index + 1}`
              : `Step ${index + 1} completed`
        }
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition ${
          state === 'current'
            ? 'bg-moon-500/10'
            : state === 'completed'
              ? 'opacity-50 cursor-default'
              : 'hover:bg-night-800/60'
        }`}
      >
        <StatusDot state={state} />
        <div className="shrink-0 w-7 h-7 rounded-full bg-night-800/80 grid place-items-center text-moon-300">
          <StepIcon iconKey={step.icon} size={13} />
        </div>
        <span
          className={`flex-1 text-sm truncate ${
            state === 'completed' ? 'line-through text-night-500' : ''
          } ${state === 'current' ? 'text-night-50' : 'text-night-200'}`}
        >
          {step.title}
        </span>
        <span className="text-xs text-night-500 tabular-nums shrink-0">{step.minutes}m</span>
      </button>
    </li>
  );
}

function StatusDot({ state }: { state: RowState }) {
  if (state === 'completed') {
    return (
      <span className="shrink-0 w-5 h-5 rounded-full bg-moon-500/80 grid place-items-center text-night-950">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  }
  if (state === 'current') {
    return <span className="shrink-0 w-5 h-5 rounded-full border-2 border-moon-300 animate-pulse-slow" />;
  }
  return <span className="shrink-0 w-5 h-5 rounded-full border border-night-600" />;
}
