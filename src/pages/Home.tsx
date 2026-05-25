import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNow } from '@/hooks/useNow';
import { useAutoDim } from '@/hooks/useAutoDim';
import { useNotifications } from '@/hooks/useNotifications';
import {
  selectBedtimeFor,
  selectRoutineMinutes,
  useAppStore,
} from '@/store/useAppStore';
import { formatCountdown, formatHHMM, nextBedtime, windDownStart } from '@/lib/time';
import { ListChecks, Moon, Play } from 'lucide-react';

export default function Home() {
  const now = useNow(1000);
  const settings = useAppStore((s) => s.settings);
  const routine = useAppStore((s) => s.routine);
  const totalMinutes = useAppStore(selectRoutineMinutes);
  const bedtimeStr = useAppStore((s) => selectBedtimeFor(s, now));

  const bed = nextBedtime(bedtimeStr, now);
  const wd = windDownStart(bed, settings.windDownMinutes);
  const msToBedtime = bed.getTime() - now.getTime();
  const msToWindDown = wd.getTime() - now.getTime();
  const inWindDown = msToWindDown <= 0 && msToBedtime > 0;
  const isTomorrow = bed.getDate() !== now.getDate();

  useAutoDim(msToBedtime);
  useNotifications({
    enabled: settings.notificationsEnabled,
    bedtimeHHMM: bedtimeStr,
    windDownMinutes: settings.windDownMinutes,
  });

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      {/* Soft animated glow behind the countdown — slow breathing rhythm.
          Positioning is on a static wrapper because Framer Motion's `scale`
          writes to `transform`, which would clobber Tailwind's translate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[20vh]"
      >
        <motion.div
          className="w-[60vw] h-[60vw] max-w-[480px] max-h-[480px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)',
            filter: 'blur(8px)',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="uppercase tracking-[0.3em] text-xs text-moon-300/80 mb-6">
          {inWindDown ? 'Wind-down has begun' : 'Until wind-down'}
        </p>

        <div className="text-6xl sm:text-7xl font-light tabular-nums">
          {inWindDown
            ? formatCountdown(msToBedtime)
            : formatCountdown(msToWindDown)}
        </div>

        <p className="mt-3 text-sm text-night-500">
          {inWindDown ? 'Lights out at' : isTomorrow ? 'Tomorrow' : 'Bedtime'} {bedtimeStr}
        </p>

        <p className="mt-1 text-xs text-night-600 tabular-nums">
          now {formatHHMM(now)}
        </p>

        {inWindDown && (
          <Link
            to="/player"
            className="mt-8 px-6 py-3 rounded-full bg-moon-500 text-night-950 font-medium shadow-lg shadow-moon-500/30 hover:bg-moon-400 transition flex items-center gap-2"
          >
            <Play size={16} strokeWidth={2.4} fill="currentColor" />
            Start routine
          </Link>
        )}

        <div className="mt-10 w-full max-w-sm grid grid-cols-2 gap-3 text-left">
          <Link
            to="/settings"
            className="rounded-2xl bg-night-800/70 border border-night-700 p-4 hover:bg-night-700/60 transition"
          >
            <Moon size={18} className="text-moon-300 mb-2" />
            <div className="text-xs text-night-500">Bedtime</div>
            <div className="text-lg">{bedtimeStr}</div>
          </Link>
          <Link
            to="/editor"
            className="rounded-2xl bg-night-800/70 border border-night-700 p-4 hover:bg-night-700/60 transition"
          >
            <ListChecks size={18} className="text-moon-300 mb-2" />
            <div className="text-xs text-night-500">Tonight</div>
            <div className="text-lg">
              {routine.length} steps · {totalMinutes}m
            </div>
          </Link>
        </div>

        {/* Dev-only: jump straight into the player without mutating bedtime. */}
        {import.meta.env.DEV && (
          <Link
            to="/player"
            className="mt-6 text-[10px] tracking-widest uppercase text-night-600 hover:text-moon-300"
          >
            dev · skip to player
          </Link>
        )}
      </div>
    </section>
  );
}
