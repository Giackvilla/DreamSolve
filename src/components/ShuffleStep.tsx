import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pickWord } from '@/lib/shuffleWords';

/**
 * Cognitive Shuffle visualization. Renders one neutral noun at a time, cycling
 * every `intervalMs`. The user briefly pictures the word and waits for the next
 * — per Beaudoin's SDIT protocol. No buttons, no chrome; the player chrome
 * (close, countdown, step list) sits around it.
 *
 * Optional `paused`: freezes the rotation (no new words while the routine is
 * paused). Reads `prefers-reduced-motion` and disables the crossfade if set.
 */
export function ShuffleStep({
  intervalMs = 8000,
  paused = false,
}: {
  intervalMs?: number;
  paused?: boolean;
}) {
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  const [word, setWord] = useState<string>(() => pickWord());

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setWord((prev) => pickWord(prev));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, paused]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={word}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
          transition={{ duration: reducedMotion ? 0 : 1.2, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl font-light tracking-wide text-moon-100 select-none"
          style={{ textShadow: '0 0 24px rgba(139,92,246,0.25)' }}
        >
          {word}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
