import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Practice } from '@/store/types';

/**
 * Pattern-driven breathing visualization. The circle expands/contracts and a
 * phase label fades in/out in sync with the pattern's phases.
 *
 * Patterns supported (per Practice['pattern']):
 *  - 4-7-8        — inhale 4 · hold 7 · exhale 8       (classic, parasympathetic)
 *  - cyclic-sigh  — inhale 4 · top up 2 · exhale 6     (Stanford 2023 RCT)
 *  - coherent     — inhale 5.5 · exhale 5.5            (~5.5 BPM resonance)
 *  - box          — inhale 4 · hold 4 · exhale 4 · hold 4  (Navy SEAL)
 *
 * Scale floor is 0.6 (rest) and ceiling 1.0 (full inhale). Opacity follows
 * scale linearly so the circle's *presence* tracks the breath.
 */

type BreathingPattern = Extract<Practice, { kind: 'breathing' }>['pattern'];

type Phase = { /** Scale at the end of this phase. */ scaleTo: number; label: string; duration: number };

const PATTERNS: Record<BreathingPattern, { name: string; phases: readonly Phase[] }> = {
  '4-7-8': {
    name: '4-7-8',
    phases: [
      { scaleTo: 1.0, label: 'Inhale', duration: 4 },
      { scaleTo: 1.0, label: 'Hold', duration: 7 },
      { scaleTo: 0.6, label: 'Exhale', duration: 8 },
    ],
  },
  'cyclic-sigh': {
    name: 'Cyclic sighing',
    phases: [
      { scaleTo: 0.85, label: 'Inhale', duration: 4 },
      { scaleTo: 1.0, label: 'Top up', duration: 2 },
      { scaleTo: 0.6, label: 'Exhale', duration: 6 },
    ],
  },
  coherent: {
    name: 'Coherent',
    phases: [
      { scaleTo: 1.0, label: 'In', duration: 5.5 },
      { scaleTo: 0.6, label: 'Out', duration: 5.5 },
    ],
  },
  box: {
    name: 'Box',
    phases: [
      { scaleTo: 1.0, label: 'Inhale', duration: 4 },
      { scaleTo: 1.0, label: 'Hold', duration: 4 },
      { scaleTo: 0.6, label: 'Exhale', duration: 4 },
      { scaleTo: 0.6, label: 'Hold', duration: 4 },
    ],
  },
};

const FLOOR = 0.6;
const CEIL = 1.0;
const OPACITY_FLOOR = 0.55;
const OPACITY_CEIL = 1.0;

function opacityForScale(s: number): number {
  return OPACITY_FLOOR + ((s - FLOOR) * (OPACITY_CEIL - OPACITY_FLOOR)) / (CEIL - FLOOR);
}

export function BreathingCircle({
  pattern = '4-7-8',
  paused,
}: {
  pattern?: BreathingPattern;
  paused: boolean;
}) {
  const config = PATTERNS[pattern];

  // Precompute keyframes once per pattern. Start scale = the LAST phase's
  // scaleTo so the loop seam doesn't pop.
  const { scales, opacities, times, cycle } = useMemo(() => {
    const phases = config.phases;
    const cycle = phases.reduce((a, p) => a + p.duration, 0);
    const startScale = phases[phases.length - 1]!.scaleTo;
    const scales = [startScale, ...phases.map((p) => p.scaleTo)];
    const opacities = scales.map(opacityForScale);
    const ts: number[] = [0];
    let acc = 0;
    for (const p of phases) {
      acc += p.duration;
      ts.push(acc / cycle);
    }
    return { scales, opacities, times: ts, cycle };
  }, [config]);

  // Phase-label tracker: poll the cycle position every 200ms and surface
  // the current phase's label so the user knows what to do (especially for
  // cyclic-sigh's two-stage inhale).
  const [phaseIdx, setPhaseIdx] = useState(0);
  useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const t = ((Date.now() - start) / 1000) % cycle;
      let acc = 0;
      for (let i = 0; i < config.phases.length; i++) {
        acc += config.phases[i]!.duration;
        if (t < acc) {
          setPhaseIdx(i);
          return;
        }
      }
      setPhaseIdx(config.phases.length - 1);
    }, 200);
    return () => window.clearInterval(id);
  }, [config, cycle, paused]);

  return (
    <>
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
              : { scale: scales, opacity: opacities }
          }
          transition={
            paused
              ? { duration: 0.6, ease: 'easeOut' }
              : { duration: cycle, repeat: Infinity, ease: 'easeInOut', times }
          }
        />
      </div>
      <PhaseLabel label={paused ? 'Paused' : (config.phases[phaseIdx]?.label ?? '')} />
    </>
  );
}

function PhaseLabel({ label }: { label: string }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-[34%] flex items-center justify-center"
    >
      <motion.span
        key={label}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-xs uppercase tracking-[0.3em] text-moon-300/80 select-none"
      >
        {label}
      </motion.span>
    </div>
  );
}
