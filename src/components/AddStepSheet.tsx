import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { ICON_KEYS, ICON_CATALOG, StepIcon, type IconKey } from '@/lib/icons';
import { SUGGESTED_STEPS } from '@/lib/suggestedSteps';

export type NewStepDraft = {
  title: string;
  minutes: number;
  icon: IconKey;
};

/**
 * Inline "Add step" sheet: choose a suggested template OR start blank, with
 * an icon picker for the blank path. Closes by calling onCancel; submits by
 * calling onCreate with the draft.
 */
export function AddStepSheet({
  onCreate,
  onCancel,
  remainingMinutes,
}: {
  onCreate: (draft: NewStepDraft) => void;
  onCancel: () => void;
  remainingMinutes: number;
}) {
  const [tab, setTab] = useState<'suggested' | 'custom'>('suggested');
  const [draft, setDraft] = useState<NewStepDraft>({
    title: '',
    minutes: Math.max(5, Math.min(15, remainingMinutes > 0 ? remainingMinutes : 5)),
    icon: 'list-checks',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-moon-500/40 bg-night-800/90 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 bg-night-900 rounded-full p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab('suggested')}
            className={`px-3 py-1 rounded-full transition ${
              tab === 'suggested'
                ? 'bg-moon-500 text-night-950'
                : 'text-night-300 hover:text-night-100'
            }`}
          >
            Suggested
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`px-3 py-1 rounded-full transition ${
              tab === 'custom'
                ? 'bg-moon-500 text-night-950'
                : 'text-night-300 hover:text-night-100'
            }`}
          >
            Custom
          </button>
        </div>
        <button
          type="button"
          aria-label="Cancel add step"
          onClick={onCancel}
          className="text-night-500 hover:text-night-200 p-1"
        >
          <X size={14} />
        </button>
      </div>

      {tab === 'suggested' ? (
        <SuggestedList onPick={onCreate} />
      ) : (
        <CustomForm
          draft={draft}
          setDraft={setDraft}
          onSubmit={() => {
            if (!draft.title.trim()) return;
            onCreate({ ...draft, title: draft.title.trim() });
          }}
        />
      )}
    </motion.div>
  );
}

function SuggestedList({ onPick }: { onPick: (s: NewStepDraft) => void }) {
  return (
    <ul className="max-h-72 overflow-y-auto no-scrollbar -mx-1 px-1 space-y-1">
      {SUGGESTED_STEPS.map((s) => (
        <li key={s.title}>
          <button
            type="button"
            onClick={() => onPick({ title: s.title, minutes: s.minutes, icon: s.icon })}
            title={s.why}
            className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-night-700/70 transition flex items-center gap-3"
          >
            <span className="shrink-0 w-8 h-8 rounded-full bg-night-700/60 grid place-items-center text-moon-300">
              <StepIcon iconKey={s.icon} size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{s.title}</div>
              <div className="text-xs text-night-500 truncate">{s.why}</div>
            </div>
            <span className="shrink-0 text-xs text-night-500 tabular-nums">{s.minutes}m</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CustomForm({
  draft,
  setDraft,
  onSubmit,
}: {
  draft: NewStepDraft;
  setDraft: (d: NewStepDraft) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3">
      <input
        autoFocus
        placeholder="What is this step?"
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
        }}
        className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-moon-500/60"
      />
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={60}
          value={draft.minutes}
          onChange={(e) =>
            setDraft({ ...draft, minutes: Math.max(1, Number(e.target.value) || 1) })
          }
          className="w-20 bg-night-900 border border-night-700 rounded-xl px-3 py-2.5 text-sm tabular-nums text-right focus:outline-none focus:border-moon-500/60"
        />
        <span className="text-sm text-night-500">min</span>
      </div>
      <IconPicker value={draft.icon} onChange={(icon) => setDraft({ ...draft, icon })} />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!draft.title.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-moon-500 text-night-950 py-2.5 font-medium hover:bg-moon-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={14} strokeWidth={2.4} />
        Add step
      </button>
    </div>
  );
}

export function IconPicker({
  value,
  onChange,
}: {
  value: IconKey;
  onChange: (key: IconKey) => void;
}) {
  return (
    <div>
      <div className="text-xs text-night-500 mb-2">Icon</div>
      <div className="grid grid-cols-6 gap-1.5">
        {ICON_KEYS.map((key) => {
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              aria-label={ICON_CATALOG[key].label}
              title={ICON_CATALOG[key].label}
              onClick={() => onChange(key)}
              className={`aspect-square rounded-lg grid place-items-center transition ${
                active
                  ? 'bg-moon-500 text-night-950'
                  : 'bg-night-900 text-night-300 hover:bg-night-700'
              }`}
            >
              <StepIcon iconKey={key} size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
