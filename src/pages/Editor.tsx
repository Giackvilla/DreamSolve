import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { selectRoutineMinutes, useAppStore } from '@/store/useAppStore';
import type { RoutineStep } from '@/store/types';
import { StepIcon, type IconKey } from '@/lib/icons';
import { AddStepSheet, IconPicker } from '@/components/AddStepSheet';

const TARGET_MIN = 60;

export default function Editor() {
  const routine = useAppStore((s) => s.routine);
  const total = useAppStore(selectRoutineMinutes);
  const addStep = useAppStore((s) => s.addStep);
  const removeStep = useAppStore((s) => s.removeStep);
  const updateStep = useAppStore((s) => s.updateStep);
  const reorderSteps = useAppStore((s) => s.reorderSteps);
  const resetRoutine = useAppStore((s) => s.resetRoutine);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = routine.map((r) => r.id);
    const next = arrayMove(ids, ids.indexOf(active.id as string), ids.indexOf(over.id as string));
    reorderSteps(next);
  };

  const overBudget = total > TARGET_MIN;
  const remainingBudget = TARGET_MIN - total;

  return (
    <section className="px-6 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="text-2xl font-light mb-1">Tonight's routine</h1>
      <p className="text-sm text-night-500 mb-4">
        Drag to reorder · tap a step to edit
      </p>

      <BudgetBar total={total} target={TARGET_MIN} overBudget={overBudget} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={routine.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2 mt-5">
            {routine.map((step, i) => (
              <SortableRow
                key={step.id}
                index={i}
                step={step}
                editing={editingId === step.id}
                onStartEdit={() => setEditingId(step.id)}
                onStopEdit={() => setEditingId(null)}
                onChange={(patch) => updateStep(step.id, patch)}
                onDelete={() => {
                  if (editingId === step.id) setEditingId(null);
                  removeStep(step.id);
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="mt-3">
          <AddStepSheet
            remainingMinutes={remainingBudget}
            onCancel={() => setAdding(false)}
            onCreate={(draft) => {
              addStep(draft);
              setAdding(false);
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-night-600 text-night-300 py-3 hover:text-moon-300 hover:border-moon-500/50 transition"
        >
          <Plus size={18} strokeWidth={1.8} />
          Add step
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          if (confirm('Reset routine to the default 60-minute wind-down?')) {
            resetRoutine();
            setEditingId(null);
            setAdding(false);
          }
        }}
        className="mt-6 w-full flex items-center justify-center gap-2 text-xs text-night-500 hover:text-night-300 transition"
      >
        <RotateCcw size={12} />
        Reset to defaults
      </button>
    </section>
  );
}

function BudgetBar({
  total,
  target,
  overBudget,
}: {
  total: number;
  target: number;
  overBudget: boolean;
}) {
  const pct = Math.min(100, (total / target) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className={overBudget ? 'text-ember-400' : 'text-night-50'}>
          <span className="tabular-nums">{total}</span> / {target} min
        </span>
        {overBudget && (
          <span className="text-xs text-ember-400">
            {total - target}m over — trim a step
          </span>
        )}
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-night-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            overBudget ? 'bg-ember-500' : 'bg-moon-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type RowProps = {
  index: number;
  step: RoutineStep;
  editing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onChange: (patch: Partial<RoutineStep>) => void;
  onDelete: () => void;
};

function SortableRow({
  index,
  step,
  editing,
  onStartEdit,
  onStopEdit,
  onChange,
  onDelete,
}: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 30 : 'auto',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border bg-night-800/70 ${
        editing ? 'border-moon-500/60' : 'border-night-700'
      } ${isDragging ? 'shadow-lg shadow-black/40' : ''}`}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="px-2 flex items-center text-night-500 touch-none cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>

        {editing ? (
          <div className="flex-1 py-3 pr-2 space-y-3">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={step.title}
                onChange={(e) => onChange({ title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onStopEdit();
                }}
                className="flex-1 bg-night-900 border border-night-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-moon-500/60"
              />
              <input
                type="number"
                min={1}
                max={120}
                value={step.minutes}
                onChange={(e) =>
                  onChange({ minutes: Math.max(1, Number(e.target.value) || 1) })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onStopEdit();
                }}
                className="w-16 bg-night-900 border border-night-700 rounded-lg px-2 py-2 text-sm tabular-nums text-right focus:outline-none focus:border-moon-500/60"
              />
              <span className="text-night-500 text-sm">m</span>
            </div>
            <IconPicker
              value={(step.icon as IconKey) || 'list-checks'}
              onChange={(icon) => onChange({ icon })}
            />
            <button
              type="button"
              onClick={onStopEdit}
              className="w-full text-xs text-moon-300 hover:text-moon-200"
            >
              Done editing
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className="flex-1 flex items-center justify-between py-3 pr-2 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-night-500 text-sm w-5 tabular-nums shrink-0">
                {index + 1}
              </span>
              <span className="shrink-0 w-8 h-8 rounded-full bg-night-700/60 grid place-items-center text-moon-300">
                <StepIcon iconKey={step.icon} size={14} />
              </span>
              <span className="truncate">{step.title}</span>
            </div>
            <span className="text-moon-300 text-sm tabular-nums ml-2 shrink-0">
              {step.minutes}m
            </span>
          </button>
        )}

        <button
          type="button"
          aria-label="Delete step"
          onClick={onDelete}
          className="px-3 flex items-center text-night-500 hover:text-ember-400 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
