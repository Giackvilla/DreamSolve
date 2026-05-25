import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pause, Play as PlayIcon, SkipForward, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  remainingMs,
  useSessionStore,
} from '@/store/useSessionStore';
import { useNow } from '@/hooks/useNow';
import { useWakeLock } from '@/hooks/useWakeLock';
import { formatCountdown, nextBedtime } from '@/lib/time';
import { BreathingCircle } from '@/components/BreathingCircle';

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
      // If user navigates away mid-session, reset so a future entry starts fresh.
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
    // Empty routine guard.
    return (
      <section className="min-h-[100dvh] flex flex-col items-center justify-center bg-night-950 px-6 text-center">
        <p className="text-night-300">Your routine has no steps.</p>
        <button
          onClick={() => navigate('/editor')}
          className="mt-6 text-moon-300 underline"
        >
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

  // Wall-clock minutes-to-bed for the bottom anchor.
  const bed = useMemo(() => nextBedtime(bedtime, now), [bedtime, now]);
  const minutesToBed = Math.max(0, Math.round((bed.getTime() - now.getTime()) / 60_000));

  const paused = session.status === 'paused';

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

      {/* Center: step title + countdown */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center"
        >
          <p className="uppercase tracking-[0.3em] text-xs text-moon-300/80 mb-6">
            Step {session.stepIndex + 1}
          </p>
          <h1 className="text-2xl font-light max-w-xs">{step.title}</h1>
          <div className="mt-10 text-7xl sm:text-8xl font-light tabular-nums">
            {formatCountdown(remaining)}
          </div>
        </motion.div>

        {/* Step progress bar */}
        <div className="mt-10 w-56 h-1 rounded-full bg-night-700 overflow-hidden">
          <div
            className="h-full bg-moon-500 transition-[width] duration-200 ease-linear"
            style={{ width: `${Math.min(100, pct * 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div
        className="relative z-10 px-6 pb-10 flex flex-col items-center gap-6"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)' }}
      >
        <div className="flex items-center gap-3">
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

        <p className="text-xs text-night-500 tabular-nums">
          {minutesToBed}m until lights out
        </p>
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
