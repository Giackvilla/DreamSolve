import { motion } from 'framer-motion';

/**
 * 4-7-8 breathing visualization, behind the step countdown.
 * Inhale 4s → hold 7s → exhale 8s, loops. Pure CSS/motion — no audio.
 *
 * Total cycle = 19s. Scale 0.6 → 1.0 (inhale), hold at 1.0 (hold), 1.0 → 0.6 (exhale).
 * Times expressed as fractions of the 19-second cycle.
 */
export function BreathingCircle({ paused }: { paused: boolean }) {
  const cycle = 4 + 7 + 8;
  const inhale = 4 / cycle;
  const hold = 7 / cycle;
  // Wrap with a non-animated positioning div; animate scale/opacity on the inner.
  // Framer Motion writes to `transform`, which would clobber Tailwind's translate utilities.
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <motion.div
        className="w-[70vw] h-[70vw] max-w-[420px] max-h-[420px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.32) 0%, rgba(139,92,246,0.08) 50%, transparent 75%)',
          filter: 'blur(2px)',
        }}
        animate={
          paused
            ? { scale: 0.85, opacity: 0.55 }
            : { scale: [0.6, 1.0, 1.0, 0.6], opacity: [0.55, 1, 1, 0.55] }
        }
        transition={
          paused
            ? { duration: 0.6, ease: 'easeOut' }
            : {
                duration: cycle,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, inhale, inhale + hold, 1],
              }
        }
      />
    </div>
  );
}
