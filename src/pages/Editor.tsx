import { selectRoutineMinutes, useAppStore } from '@/store/useAppStore';

// Placeholder for P1 — drag-sortable list, add/edit/delete steps lands there.
export default function Editor() {
  const routine = useAppStore((s) => s.routine);
  const total = useAppStore(selectRoutineMinutes);
  return (
    <section className="px-6 pt-12 max-w-md mx-auto">
      <h1 className="text-2xl font-light mb-1">Tonight's routine</h1>
      <p className="text-sm text-night-500 mb-6">
        {total} / 60 min · {routine.length} steps
      </p>
      <ul className="space-y-2">
        {routine.map((r, i) => (
          <li
            key={r.id}
            className="rounded-2xl bg-night-800/70 border border-night-700 px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-night-500 text-sm w-6 tabular-nums">{i + 1}</span>
              <span>{r.title}</span>
            </div>
            <span className="text-moon-300 text-sm tabular-nums">{r.minutes}m</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-night-500 mt-6">
        Add / reorder / delete arrives in phase P1.
      </p>
    </section>
  );
}
