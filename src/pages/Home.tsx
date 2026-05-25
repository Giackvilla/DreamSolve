import { Link } from 'react-router-dom';
import { useNow } from '@/hooks/useNow';
import {
  selectBedtimeFor,
  selectRoutineMinutes,
  useAppStore,
} from '@/store/useAppStore';
import { formatCountdown, nextBedtime, windDownStart } from '@/lib/time';
import { Moon, ListChecks } from 'lucide-react';

export default function Home() {
  const now = useNow(1000);
  const settings = useAppStore((s) => s.settings);
  const routine = useAppStore((s) => s.routine);
  const totalMinutes = useAppStore(selectRoutineMinutes);
  const bedtimeStr = useAppStore((s) => selectBedtimeFor(s, now));

  const bed = nextBedtime(bedtimeStr, now);
  const wd = windDownStart(bed, settings.windDownMinutes);
  const msToWindDown = wd.getTime() - now.getTime();
  const inWindDown = msToWindDown <= 0 && now.getTime() < bed.getTime();

  return (
    <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      <p className="uppercase tracking-[0.3em] text-xs text-moon-300/80 mb-6">
        {inWindDown ? 'Wind-down has begun' : 'Until wind-down'}
      </p>

      <div className="text-6xl sm:text-7xl font-light tabular-nums">
        {inWindDown ? formatCountdown(bed.getTime() - now.getTime()) : formatCountdown(msToWindDown)}
      </div>

      <p className="mt-3 text-sm text-night-500">
        {inWindDown ? 'Lights out at' : 'Bedtime'} {bedtimeStr}
      </p>

      {inWindDown && (
        <Link
          to="/player"
          className="mt-10 px-6 py-3 rounded-full bg-moon-500 text-night-950 font-medium shadow-lg shadow-moon-500/30 hover:bg-moon-400 transition"
        >
          Start routine
        </Link>
      )}

      <div className="mt-12 w-full max-w-sm grid grid-cols-2 gap-3 text-left">
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
    </section>
  );
}
