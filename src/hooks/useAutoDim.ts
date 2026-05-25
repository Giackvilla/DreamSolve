import { useEffect } from 'react';

/**
 * Interpolates UI brightness + warmth based on minutes-to-bedtime.
 *
 * Curve (locked per RESEARCH-P2-P3.md §5):
 *   > 90 min  → brightness 1.00, warmth 0.00 (normal)
 *   90 → 0  → brightness 1.00 → 0.55, warmth 0.00 → 0.25 (linear)
 *   ≤ 0    → brightness 0.55, warmth 0.25 (held, fully dimmed)
 *
 * Writes to the CSS variables --ui-brightness and --ui-warmth on :root,
 * which a single `filter:` on #root already maps to brightness()/sepia().
 */
export function useAutoDim(msToBedtime: number) {
  useEffect(() => {
    const minutes = msToBedtime / 60_000;
    const t = clamp((90 - minutes) / 90, 0, 1); // 0 = far away, 1 = at/past bedtime
    const brightness = lerp(1.0, 0.55, t);
    const warmth = lerp(0.0, 0.25, t);
    const root = document.documentElement;
    root.style.setProperty('--ui-brightness', brightness.toFixed(3));
    root.style.setProperty('--ui-warmth', warmth.toFixed(3));
  }, [msToBedtime]);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
