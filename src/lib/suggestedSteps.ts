import type { IconKey } from './icons';

export type SuggestedStep = {
  title: string;
  minutes: number;
  icon: IconKey;
  /** One-line "why" — surfaced as a tooltip in the picker. */
  why: string;
};

/**
 * Curated wind-down activities. Defaults drawn from NIH NHLBI's "Your Guide
 * to Healthy Sleep", CDC's About Sleep, Harvard Health's sleep hygiene
 * piece, and the 2022 PMC paper "The '5 principles' of good sleep health".
 * Not prescriptive — just useful starting points.
 */
export const SUGGESTED_STEPS: SuggestedStep[] = [
  {
    title: 'Tidy up · set out tomorrow',
    minutes: 10,
    icon: 'sparkles',
    why: 'Reduces morning friction; off-loads tomorrow from your head.',
  },
  {
    title: 'Dim lights · phone on charger',
    minutes: 5,
    icon: 'lamp',
    why: 'Bright light suppresses melatonin. Charge across the room.',
  },
  {
    title: 'Shower · skincare',
    minutes: 15,
    icon: 'bath',
    why: 'A warm shower 90 min before bed helps core temp drop into sleep.',
  },
  {
    title: 'Stretch · light yoga',
    minutes: 10,
    icon: 'activity',
    why: 'Releases tension; not so intense that it spikes alertness.',
  },
  {
    title: 'Read on paper',
    minutes: 15,
    icon: 'book-open',
    why: 'Calms the mind without the screen-light cost.',
  },
  {
    title: 'Journal · brain dump',
    minutes: 10,
    icon: 'pen-tool',
    why: 'Externalizing tomorrow’s worries lowers nighttime rumination.',
  },
  {
    title: 'Breathing (4-7-8)',
    minutes: 5,
    icon: 'wind',
    why: 'Activates the parasympathetic system; pairs with the pulsing-circle UI.',
  },
  {
    title: 'Meditate',
    minutes: 10,
    icon: 'brain',
    why: 'Even short sessions shift you out of work-brain mode.',
  },
  {
    title: 'Walk · short loop outside',
    minutes: 10,
    icon: 'footprints',
    why: 'A few minutes outside helps decouple from the day.',
  },
  {
    title: 'Caffeine-free tea',
    minutes: 5,
    icon: 'leaf',
    why: 'Chamomile, rooibos, peppermint. Ritualizes the wind-down.',
  },
  {
    title: 'Calming music',
    minutes: 10,
    icon: 'music',
    why: 'Low-tempo, low-novelty. Lyrics-free works best for most.',
  },
  {
    title: 'Cool the bedroom',
    minutes: 2,
    icon: 'thermometer',
    why: 'Sleep onset is fastest around 65–68°F / 18–20°C.',
  },
  {
    title: 'Call · text someone you love',
    minutes: 10,
    icon: 'heart',
    why: 'Social connection at end of day, not work email.',
  },
  {
    title: 'Skip late caffeine',
    minutes: 1,
    icon: 'coffee',
    why: 'Half-life of caffeine is 5–6 hours; avoid after early afternoon.',
  },
];
