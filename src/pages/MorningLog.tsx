import { useMemo } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { isoDateDaysAgo, toLocalISO } from '@/lib/time';

// "Last night" = the calendar date the user went to bed yesterday.
// The same key holds all of today, so morning-coffee logging and evening
// "did I tap that?" check both land on the same entry.

export default function MorningLog() {
  const log = useAppStore((s) => s.log);
  const logNight = useAppStore((s) => s.logNight);

  const lastNight = isoDateDaysAgo(1);
  const lastNightEntry = log.find((e) => e.date === lastNight);

  const streak = useMemo(() => {
    let count = 0;
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const entry = log.find((e) => e.date === toLocalISO(cursor));
      if (!entry?.completed) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
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

      {/* Prompt — always rendered; both buttons visible so the answer is
          undoable. The current selection (if any) is highlighted; tapping the
          other re-logs the night with the new answer. */}
      <div className="rounded-2xl bg-night-800/70 border border-night-700 p-5 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm">Did you finish last night's routine?</div>
          {lastNightEntry && (
            <div className="text-xs text-night-500">tap to change</div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => logNight(lastNight, true)}
            aria-pressed={lastNightEntry?.completed === true}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 font-medium transition ${
              lastNightEntry?.completed === true
                ? 'bg-moon-500 text-night-950 hover:bg-moon-400'
                : 'bg-night-700 text-night-100 hover:bg-night-600'
            }`}
          >
            <Check size={16} strokeWidth={2.4} />
            Yes
          </button>
          <button
            onClick={() => logNight(lastNight, false)}
            aria-pressed={lastNightEntry?.completed === false}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 transition ${
              lastNightEntry?.completed === false
                ? 'bg-ember-500/80 text-night-950 font-medium hover:bg-ember-400'
                : 'bg-night-700 text-night-100 hover:bg-night-600'
            }`}
          >
            <XIcon size={16} />
            No
          </button>
        </div>
      </div>

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
