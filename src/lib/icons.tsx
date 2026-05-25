import {
  Activity,
  Bath,
  BookOpen,
  Brain,
  Coffee,
  Dumbbell,
  Footprints,
  Heart,
  Lamp,
  Leaf,
  ListChecks,
  Moon,
  Music,
  PenTool,
  Pill,
  Sparkles,
  Thermometer,
  type LucideIcon,
  Wind,
} from 'lucide-react';

/**
 * Curated icon catalog for routine steps. Stored as a string key on each
 * RoutineStep so the persisted JSON stays small and refactor-safe.
 *
 * Add new keys by appending — DO NOT rename keys, or stored routines lose
 * their icons. `list-checks` is the safe fallback for anything unknown.
 */
export const ICON_CATALOG = {
  'list-checks': { Component: ListChecks, label: 'Checklist' },
  sparkles: { Component: Sparkles, label: 'Tidy' },
  lamp: { Component: Lamp, label: 'Dim lights' },
  bath: { Component: Bath, label: 'Shower' },
  activity: { Component: Activity, label: 'Stretch' },
  dumbbell: { Component: Dumbbell, label: 'Movement' },
  'book-open': { Component: BookOpen, label: 'Read' },
  'pen-tool': { Component: PenTool, label: 'Journal' },
  wind: { Component: Wind, label: 'Breathing' },
  brain: { Component: Brain, label: 'Meditate' },
  footprints: { Component: Footprints, label: 'Walk' },
  music: { Component: Music, label: 'Music' },
  leaf: { Component: Leaf, label: 'Tea' },
  coffee: { Component: Coffee, label: 'No caffeine' },
  pill: { Component: Pill, label: 'Supplement' },
  thermometer: { Component: Thermometer, label: 'Cool room' },
  heart: { Component: Heart, label: 'Connect' },
  moon: { Component: Moon, label: 'Bedtime' },
} satisfies Record<string, { Component: LucideIcon; label: string }>;

export type IconKey = keyof typeof ICON_CATALOG;
export const ICON_KEYS = Object.keys(ICON_CATALOG) as IconKey[];

/**
 * Renders a step icon by its catalog key. Falls back to the checklist icon
 * when the key is missing, unknown, or legacy — never throws.
 */
export function StepIcon({
  iconKey,
  size = 18,
  className,
  strokeWidth = 1.6,
}: {
  iconKey: string | undefined;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const entry =
    (iconKey && (ICON_CATALOG as Record<string, { Component: LucideIcon }>)[iconKey]) ||
    ICON_CATALOG['list-checks'];
  const Icon = entry.Component;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
