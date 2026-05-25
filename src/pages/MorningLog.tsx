import { useMemo } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

/** Returns the ISO date (YYYY-MM-DD) for *last night* in the local timezone. */
function lastNightKey(now: Date = new Date()): string {
  // The "night of" date is the calendar date the user *went to bed*. Anything
  // before noon today, we assume the user is logging last night. After noon,
  // it's still last night until the next sleep cycle — same key holds.
  const target = new Date(now);
  target.setDate(target.getDate() - 1);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoDateDaysAgo(days: number, now = new Date()): string {
  const t = new Date(now);
  t.setDate(t.getDate() - days);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MorningLog() {
  const log = useAppStore((s) => s.log);
  const logNight = useAppStore((s) => s.logNight);

  const lastNight = lastNightKey();
  const lastNightEntry = log.find((e) => e.date === lastNight);

  const streak = useMemo(() => {
    let count = 0;
    let cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const key = isoDateDaysAgo(0, cursor);
      const entry = log.find((e) => e.date === key);
      if (entry?.completed) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [log]);

  // 28-day grid (4 rows × 7 cols) ending at last night.
  const grid = useMemo(() => {
    const cells: { date: string; state: 'completed' | 'missed' | 'none' }[] = [];
    for (let i = 27; i >= 0; i--) {
      const date = isoDateDaysAgo(i + 1);
      const entry = log.find((e) => e.date === date);
      cells.push({
        date,
        state: entry ? (entry.completed ? 'completed' : 'missed') : 'none',
      });
    }
    return cells;
  }, [log]);

  return (
    <section className="px-6 pt-12 pb-8 max-w-md mx-auto">
      <h1 className="text-2xl font-light mb-1">Morning</h1>
      <p className="text-sm text-night-500 mb-6">
        Last night · {formatHuman(lastNight)}
      </p>

      {/* Prompt — only when last night is unlogged */}
      {!lastNightEntry && (
        <div className="rounded-2xl bg-night-800/70 border border-night-700 p-5 mb-6">
          <div className="text-sm mb-3">Did you finish last night's routine?</div>
          <div className="flex gap-2">
            <button
              onClick={() => logNight(lastNight, true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-moon-500 text-night-950 py-2.5 font-medium hover:bg-moon-400 transition"
            >
              <Check size={16} strokeWidth={2.4} />
              Yes
            </button>
            <button
              onClick={() => logNight(lastNight, false)}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-night-700 text-night-100 py-2.5 hover:bg-night-600 transition"
            >
              <XIcon size={16} />
              No
            </button>
          </div>
        </div>
      )}

      {/* Streak headline */}
      <div className="rounded-2xl bg-night-800/70 border border-night-700 p-6 text-center mb-6">
        <div className="text-6xl font-light tabular-nums">{streak}</div>
        <div className="text-sm text-night-500 mt-1">
          night{streak === 1 ? '' : 's'} streak
        </div>
      </div>

      {/* 28-day grid */}
      <div>
        <div className="text-xs text-night-500 mb-2 tracking-widest uppercase">
          Last 4 weeks
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((cell) => (
            <div
              key={cell.date}
              title={`${cell.date} · ${cell.state}`}
              className={`aspect-square rounded-md ${
                cell.state === 'completed'
                  ? 'bg-moon-500/80'
                  : cell.state === 'missed'
                    ? 'bg-night-600'
                    : 'bg-night-800 border border-night-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function formatHuman(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
