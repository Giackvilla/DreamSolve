# DreamSolve — V2 roadmap

> v1 is feature-complete and shipped at https://dreamsolve-dun.vercel.app.
> This is what's next, decided after the four-agent research pass.

## Now (building, in order)

The first five turn DreamSolve from a guided *timer* into a guided *practice*. All five sit on top of a single architectural refactor: the `RoutineStep` type gets an optional discriminated `practice` payload (`breathing` / `shuffle` / `input`). Steps without a `practice` keep the v1 generic-countdown behavior — backwards-compatible by design.

| # | Feature | Evidence anchor | Ship as |
|---|---|---|---|
| 1 | **Cognitive Shuffle** — random-word visualizer (8s per word) | [Beaudoin 2016 SDIT RCT, n=154](https://www.researchgate.net/publication/300004607) | `practice: { kind: 'shuffle' }` |
| 2 | **Constructive Worry** — 2-column worry → action sheet | [Carney worksheet](https://drcolleencarney.com/wp-content/uploads/2013/05/Constructive-Worry-Worksheet.pdf) · [Jansson-Fröjmark 2012 RCT](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/j.2044-8260.2011.02018.x) | `practice: { kind: 'input', preset: 'worry' }` |
| 3 | **Next-day to-do** — 5-item bullet list | [Scullin 2018 PSG RCT](https://pmc.ncbi.nlm.nih.gov/articles/PMC5758411/) | `practice: { kind: 'input', preset: 'todo' }` |
| 4 | **Cyclic Sighing** breathing (double-inhale → long exhale) | [Stanford 2023](https://med.stanford.edu/news/insights/2023/02/cyclic-sighing-can-help-breathe-away-anxiety.html) | `practice: { kind: 'breathing', pattern: 'cyclic-sigh' }` |
| 5 | **Coherent Breathing** (5.5 breaths/min) | Lin et al. on HRV + parasympathetic tone | `practice: { kind: 'breathing', pattern: 'coherent' }` |

Each ships **one at a time** with its own verify + push so I can use it that night and tell what feels good before piling more on top.

---

## Future (planned, not yet built)

These are deliberately *parked*, not forgotten. Each has a real reason to come later.

### 6. Morning rating + sleep latency — **tied to Whoop integration**
**Why parked:** I want this fed by real biometric data from my Whoop instead of a subjective tap. The plan:
- Use the [Whoop API v2](https://developer.whoop.com/) to pull last night's sleep performance, HR, HRV, and onset latency in the morning.
- OAuth 2.0 (PKCE flow). Refresh token stored in IndexedDB. Personal app, single user — no auth proxy needed beyond a small Vercel serverless function to keep the client-secret off the device.
- Morning screen replaces the "Did you finish?" Yes/No with: streak + last-night Whoop summary card (latency, time in bed, sleep score) + the routine completion. Streak rule becomes "completed routine AND scored ≥ X" — I'll pick X after a couple weeks of data.
- Weekly summary card (#9 from the research) gets the data it needs at the same time.

**Effort estimate:** medium. The hardest piece is the OAuth refresh-token dance and the Vercel function. The UI is small.

### 7. Progressive Muscle Relaxation
**Why parked until later:** strong evidence ([SMD −1.74](https://pubmed.ncbi.nlm.nih.gov/41633054/)) but needs an ordered sub-step sequence + a tiny SVG body silhouette with region highlights. It's a meaningful build by itself; better to ship 1–5 first and learn whether my own bedtime even has time for a 10-minute PMR step before I invest.

### 12. Ambient sound per step
**Why parked:** ~1 MB bundle hit + iOS Web Audio unlock quirks (sound only plays after a user-gesture in Safari). Not hard but worth doing once I know which steps I'd actually want sounds on. Likely the breathing steps + the cognitive shuffle. Source: Pixabay CC0 loops, bundled in `/public/sounds/`.

### 18. Gentle stretch sequence
**Why parked:** the bottleneck isn't code — it's 6–10 hand-tuned yoga-pose SVGs. Either commission them, find a CC0 set, or hand-draw. Once the assets exist the player is the same shape as #7 PMR (ordered sub-steps with a single image per step).

---

## Architectural unlock (lands with #1)

```ts
type Practice =
  | { kind: 'breathing'; pattern: 'cyclic-sigh' | 'coherent' | 'box' | '4-7-8' }
  | { kind: 'shuffle' }
  | { kind: 'input'; preset: 'worry' | 'todo' | 'gratitude' };

type RoutineStep = {
  id: string;
  title: string;
  minutes: number;
  icon?: string;
  practice?: Practice;       // undefined = generic countdown (today's v1 behavior)
};
```

Player switches on `step.practice?.kind`:
- `undefined` → today's `GenericStep` countdown.
- `'breathing'` → existing `BreathingCircle` extended with pattern presets.
- `'shuffle'` → new `ShuffleStep` (8s random word, crossfade).
- `'input'` → new `InputStep` with a preset that picks the schema (worry, todo, gratitude).

Storage:
- Step *config* lives in the existing Zustand store (already persisted to localStorage).
- Step *user input* (worry text, tomorrow's to-do list) lives in **IndexedDB via `idb-keyval`**, keyed by `night-of` ISO date. Already a project dependency.

---

## Explicitly out of scope (research saw and rejected)

| Item | Why not |
|---|---|
| Alternate-nostril breathing | One study suggests it *increases* alertness — wrong direction. |
| Dream incubation (Dormio-style) | Targets memory/creativity, not sleep onset; needs hardware. |
| Caffeine-cutoff reminder | Too prescriptive for the vibe; I already know. |
| MEQ-5 chronotype quiz | Onboarding overhead for a single user who already set bedtime. |
| Vibration cues | One-liner; iOS blocks it; do when I have an Android pass. |
| NSDR / Yoga Nidra script | Heaviest scripting work in the research pass; revisit after #1–#5 land. |
| "Letting-go" ephemeral dump animation | Weaker direct sleep evidence than #2/#3 — same idea handled by constructive worry. |
| Habit-correlation as standalone screen | Fold into the weekly summary that lands with #6. |

---

*Last updated: 2026-05-25 · synthesized from four parallel research agents.*
