import { useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNightInput } from '@/hooks/useNightInput';

type WorryRow = { worry: string; plan: string };
type WorryState = { rows: WorryRow[] };
type TodoState = { items: string[] };

/**
 * Shared input-step renderer. Branches on `preset`:
 *  - 'worry': Constructive Worry — two columns per row (worry → plan).
 *    Inspired by Carney's worksheet; tested in Jansson-Fröjmark 2012.
 *  - 'todo' : Next-day to-do — short bullet list. Scullin 2018 PSG RCT
 *    showed unloading tomorrow shortens sleep onset.
 *  - 'gratitude': three-bullet gratitude (placeholder for future).
 *
 * Auto-saves every change to IndexedDB, keyed by night-date + preset, so
 * the entry survives reload and is keyed correctly for tonight only.
 */
export function InputStep({
  preset,
  nightDate,
  title,
}: {
  preset: 'worry' | 'todo' | 'gratitude';
  nightDate: string;
  title: string;
}) {
  if (preset === 'worry') return <WorrySheet nightDate={nightDate} title={title} />;
  if (preset === 'todo') return <TodoList nightDate={nightDate} title={title} />;
  return <GratitudeList nightDate={nightDate} title={title} />;
}

function WorrySheet({ nightDate, title }: { nightDate: string; title: string }) {
  const initial: WorryState = { rows: [{ worry: '', plan: '' }] };
  const { value, setValue, loaded } = useNightInput<WorryState>('worry', nightDate, initial);

  const update = (i: number, patch: Partial<WorryRow>) => {
    const rows = value.rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    setValue({ rows });
  };
  const addRow = () => setValue({ rows: [...value.rows, { worry: '', plan: '' }] });
  const removeRow = (i: number) =>
    setValue({ rows: value.rows.filter((_, idx) => idx !== i) || [{ worry: '', plan: '' }] });

  // Auto-focus the first empty worry on mount/load.
  const firstInputRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (loaded && firstInputRef.current && !value.rows[0]?.worry) {
      firstInputRef.current.focus();
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-md mx-auto text-left">
      <p className="text-center uppercase tracking-[0.3em] text-xs text-moon-300/80 mb-1">
        {title}
      </p>
      <p className="text-center text-xs text-night-500 mb-4">
        Worries on the left · what you'll do about them on the right
      </p>
      <ul className="space-y-3">
        {value.rows.map((row, i) => (
          <li key={i} className="rounded-2xl bg-night-800/70 border border-night-700 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <textarea
                ref={i === 0 ? firstInputRef : null}
                placeholder="What's on your mind?"
                value={row.worry}
                onChange={(e) => update(i, { worry: e.target.value })}
                rows={2}
                className="bg-night-900 border border-night-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-moon-500/60"
              />
              <textarea
                placeholder="Smallest next step…"
                value={row.plan}
                onChange={(e) => update(i, { plan: e.target.value })}
                rows={2}
                className="bg-night-900 border border-night-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-moon-500/60"
              />
            </div>
            {value.rows.length > 1 && (
              <button
                type="button"
                aria-label="Remove row"
                onClick={() => removeRow(i)}
                className="text-night-500 hover:text-ember-400 text-xs flex items-center gap-1"
              >
                <Trash2 size={12} /> remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addRow}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-night-600 text-night-300 py-2.5 hover:text-moon-300 hover:border-moon-500/50 transition text-sm"
      >
        <Plus size={14} />
        Add another
      </button>
    </div>
  );
}

function TodoList({ nightDate, title }: { nightDate: string; title: string }) {
  const initial: TodoState = { items: ['', '', ''] };
  const { value, setValue, loaded } = useNightInput<TodoState>('todo', nightDate, initial);

  const update = (i: number, text: string) => {
    const items = value.items.map((s, idx) => (idx === i ? text : s));
    setValue({ items });
  };
  const addItem = () => setValue({ items: [...value.items, ''] });
  const removeItem = (i: number) =>
    setValue({ items: value.items.filter((_, idx) => idx !== i) || [''] });

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (loaded && firstInputRef.current && !value.items[0]) {
      firstInputRef.current.focus();
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-md mx-auto text-left">
      <p className="text-center uppercase tracking-[0.3em] text-xs text-moon-300/80 mb-1">
        {title}
      </p>
      <p className="text-center text-xs text-night-500 mb-4">
        Tomorrow, off your head and onto the list.
      </p>
      <ul className="space-y-2">
        {value.items.map((text, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-night-500 text-sm w-5 tabular-nums shrink-0">{i + 1}.</span>
            <input
              ref={i === 0 ? firstInputRef : null}
              value={text}
              onChange={(e) => update(i, e.target.value)}
              placeholder="Something for tomorrow…"
              className="flex-1 bg-night-900 border border-night-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-moon-500/60"
            />
            {value.items.length > 1 && (
              <button
                type="button"
                aria-label={`Remove item ${i + 1}`}
                onClick={() => removeItem(i)}
                className="text-night-500 hover:text-ember-400 p-1 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-night-600 text-night-300 py-2.5 hover:text-moon-300 hover:border-moon-500/50 transition text-sm"
      >
        <Plus size={14} />
        Add another
      </button>
    </div>
  );
}

function GratitudeList({ nightDate, title }: { nightDate: string; title: string }) {
  // Three gratitudes — same shape as todo for v1.
  return <TodoList nightDate={nightDate} title={title || 'Three things'} />;
}
