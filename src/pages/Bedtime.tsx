import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useSessionStore } from '@/store/useSessionStore';
import { nextBedtime, nightOfKey } from '@/lib/time';

/**
 * "Lights out. Goodnight." — the routine has ended.
 * Logs the night as completed and exposes a single dismiss target.
 */
export default function Bedtime() {
  const navigate = useNavigate();
  const logNight = useAppStore((s) => s.logNight);
  const bedtimeStr = useAppStore((s) => s.settings.defaultBedtime);
  const resetSession = useSessionStore((s) => s.reset);

  useEffect(() => {
    const date = nightOfKey(nextBedtime(bedtimeStr));
    logNight(date, true);
    return () => resetSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-night-950 px-6 text-center">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        <p className="uppercase tracking-[0.3em] text-xs text-moon-300/80 mb-8">
          Lights out
        </p>
        <h1 className="text-4xl sm:text-5xl font-light">Goodnight.</h1>
        <p className="mt-6 text-sm text-night-500 max-w-xs">
          Routine logged. See you in the morning.
        </p>

        <button
          onClick={() => navigate('/morning', { replace: true })}
          className="mt-12 text-xs text-night-600 hover:text-moon-300 tracking-widest uppercase"
        >
          Tap to dismiss
        </button>
      </motion.div>
    </section>
  );
}
