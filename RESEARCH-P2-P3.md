# DreamSolve — P2/P3 Research Addendum

> Deeper dive before building the **Home countdown** (P2) and the **Routine Player** (P3) — the two screens that turn DreamSolve from a config tool into a thing you actually use at night.

---

## 1. Open-source repos worth borrowing from

Ranked by relevance to what we're about to build.

### ⭐ Breathly · `mmazzarolo/breathly-app` — 581★ · TS · React Native
Source: https://github.com/mmazzarolo/breathly-app

A tiny "breath training" app, but the architecture is the cleanest blueprint I've found for "guide a user through a sequence of timed stages." Two patterns we'll port:

**1. The looped-stages state machine** (`src/screens/exercise-screen/use-exercise-loop.tsx`):

```ts
// Steps are { id: 'inhale' | 'afterInhale' | 'exhale' | 'afterExhale', duration, skipped }
// activeSteps = stepsMetadata.filter(s => !s.skipped)
// On each tick, advance currentStepIndex; loop when end is reached.
const cleanup = loopAnimations(createStepAnimations, (i) => setCurrentStepIndex(i));
```

The pattern *exactly* maps to our routine: a list of `RoutineStep`s, advance one at a time, expose `currentStep` + a tween value to drive UI. The one twist: we *don't* loop. The routine ends when the last step finishes.

**2. The skip flag.** Steps carry `skipped: boolean` and the active list is `filter(!skipped)`. We can use this instead of removing — useful if I want to "skip just tonight" without editing the routine.

Decision: lift the **stage-machine** pattern. Drop the looping. Replace RN `Animated` with **Framer Motion** + `Date.now()` deltas.

### ⭐ HeyLinda · `heylinda/heylinda-app` — 724★ · TS · React Native + Expo
Source: https://github.com/heylinda/heylinda-app

A meditation app with audio-driven sessions. Two takeaways:

- **Lifecycle:** session → `Play` screen → on `didJustFinish` → `replace('CompletedScreen')`. We'll mirror this: routine → player → on last-step-finish → `Bedtime` screen ("Lights out").
- **Redux Toolkit** state shape is heavier than what we need, but the `completed(durationMillis)` action pattern is worth copying for our `logNight(date, completed)` flow.

Decision: borrow the lifecycle shape; keep our Zustand store (no Redux).

### ai-pomo-free · `Hicruben/ai-pomo-free` — 5★ · JS · React
Source: https://github.com/Hicruben/ai-pomo-free

Small, but useful confirmation of the Pomodoro-style "full-screen timer" UI: huge tabular digits, minimal chrome, a single primary action (play/pause), and Skip below it. The minimalist defaults align with what we want.

Decision: visual reference only.

### StayAwake · `PranavArya37/StayAwake` — 5★ · JS · Vanilla PWA
Source: https://github.com/PranavArya37/StayAwake

What's useful: it ships **NoSleep.js** (`nosleep/nosleep.js`) — a video-element hack that keeps the screen awake on browsers without Wake Lock API. We won't bundle it; our target is modern browsers + iOS 16.4+. But the existence of NoSleep is the fallback we'd reach for if Wake Lock didn't work somewhere.

Decision: use native Wake Lock API only. Document NoSleep as the v2 fallback if needed.

### Honorable mentions (looked, decided against)

- `Alperengozum/Sleepwell` — sleep-cycle calculator, no relevant UI patterns for us.
- `Balzabu/nosleep-web` — same Wake Lock pattern as StayAwake.
- `lassebomh/box-breathing` — pretty SVG box-breathing visualization. Possible direct inspiration for the v1 "Breathing (4-7-8)" step UI (see §3).

---

## 2. Browser APIs that matter for P3

### 2.1 Screen Wake Lock API — **yes, use it**

iOS Safari 16.4+ supports it; installed PWAs broke on iOS until 18.4 fixed it. Caveats:

- The lock is **released automatically** when the user backgrounds the tab or PWA. We must re-request on `visibilitychange` if the page becomes visible again *while still in playback*.
- Wrap every `navigator.wakeLock.request('screen')` in `try…catch` — low-battery state can refuse the request.
- Release on `unmount` to be a good citizen.

Reference implementation pattern (will live in `src/hooks/useWakeLock.ts`):

```ts
let lock: WakeLockSentinel | null = null;
async function acquire() {
  try { lock = await navigator.wakeLock.request('screen'); } catch {}
}
function release() { lock?.release().catch(() => {}); lock = null; }
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && active) acquire();
});
```

### 2.2 Notification Triggers / Timestamp Trigger — **no, not yet**

The "schedule a notification for 22:30 even if the tab is closed" API exists but is behind a flag in Chrome and absent from Safari/Firefox. Won't bet on it for v1.

**What we'll actually do for the T-60 / T-0 ping**, in order of fallbacks:
1. **Foreground notification** via `Notification.requestPermission()` + `new Notification(...)` when the app is open and crosses T-60 or T-0. (Already trivially possible — this is just `Notification` API.)
2. **Service-worker `showNotification`** scheduled via `setTimeout` *while the SW is still alive* — fragile, but works when the app was opened earlier in the day.
3. **Document the honest limitation** in onboarding: "Keep DreamSolve installed and open near bedtime." For a personal app I use on my own phone, this is fine.

Long-term path if I care enough later: wrap with Capacitor (native local notifications) — already noted in the original `RESEARCH.md §5`.

### 2.3 `vite-plugin-pwa` background sync — **not relevant for notifications**

Background sync queues *failed fetches* for retry when online. It doesn't schedule arbitrary tasks. The plugin's `runtimeCaching` with `backgroundSync` is for an API DreamSolve doesn't have. So: not used.

---

## 3. Step-level micro-UIs (the "Breathing" step deserves more)

Generic step renderer = big countdown + step title. But our routine includes **"Breathing (4-7-8)"** — that step would feel hollow as just a countdown. Two options:

| Option | Effort | Vibe |
|---|---|---|
| **A. Pulsing circle** synced to a fixed 4-7-8 rhythm (Box Breathing case-study style — `lassebomh/box-breathing`) | Low — pure CSS/SVG | "Calm Apple Watch breathe" |
| **B. Full Breathly-style stage machine** with stage labels ("Inhale… Hold… Exhale… Hold…") | Medium | More instructive, more pedagogical |

Decision: **A for v1**, port to B in a later phase if I want the on-screen coaching. Detection: any step whose title matches `/breath/i` → render `BreathingStep` instead of `GenericStep`.

This is also the spot where "ambient sound per step" would land in v2 (see §4).

---

## 4. Data, audio, and content sources (mostly v2)

### 4.1 Sleep-hygiene knowledge — public domain, useful for defaults

The current `DEFAULT_ROUTINE` happens to track NIH/CDC/Harvard guidance on wind-down activities. Confirmed sources we can cite if I ever build a "why this step?" tooltip:

- NIH NHLBI *Your Guide to Healthy Sleep* (public-domain PDF) — wind-down hour, no screens 30+ min before bed, dim lights, cool room.
- CDC *About Sleep* page — same content, public.
- Harvard Health *Sleep Hygiene* — same.
- A 2022 PMC paper "The '5 principles' of good sleep health" (`PMC9285041`).

For v1 these aren't shipped as data — they validate the defaults. For v2 I could ship a small JSON of "suggested steps" the user picks from when building a routine.

### 4.2 Ambient audio for routine steps (v2)

If/when I add per-step ambient sound, the options:

| Source | License | Attribution | Rate limit | Verdict for shipping |
|---|---|---|---|---|
| **Pixabay sound effects** | CC0-equivalent | none required | none stated | **Best for bundled audio** — drop files into `/public/sounds/`. |
| **Freesound API** | per-track (mostly CC variants — must check each) | per-sound, varies | 60/min, 2000/day | Good for *fetch on demand*, not bundle. Needs API key from `freesound.org/apiv2/apply`. |
| Internet Archive Audio Collection | varies | varies | n/a | Sprawling; not curated enough. |

Decision for v2 only: bundle 3-4 Pixabay loops (rain, soft pad, ocean, brown noise). No API integration.

### 4.3 What to NOT add as data

- No "sleep stages" / circadian-prediction nonsense without sensor input. That's why we ruled out tracking in v1.
- No "AI-personalized routine" without months of my own logged data first.

---

## 5. P2 — Home countdown polish (small upgrade)

P0 already shipped the countdown skeleton. P2 makes it feel alive without making it busy.

### Changes
1. **Live current-time clock** under the countdown, small and dim, so the user has anchor + delta.
2. **Soft animated background glow** — gentle radial pulse synced to a slow breathing rhythm (Framer Motion's `repeat: Infinity, repeatType: 'reverse'` on a single scaling div with very low opacity).
3. **Tomorrow indicator** — if the next bedtime is *tomorrow's date* (i.e., already past today's bedtime), show "Tomorrow" subtly so it's not confusing.
4. **Auto-dimming hookup** — write to the `--ui-brightness` / `--ui-warmth` CSS vars I already wired in P0. Curve: 1.0 → 0.55 over the last 90 minutes before bedtime; warmth 0 → 0.25 over the same window. Lives in `useAutoDim()` hook called from `Layout`.
5. **"Skip to player"** dev-mode link, hidden by `import.meta.env.DEV`, so I don't have to mutate `localStorage` to test the player.

### Non-changes
- Bedtime / Tonight cards: keep as-is.
- Bottom nav: keep.

---

## 6. P3 — Routine Player (the main event)

### State machine

```
idle  ──start──▶  playing  ──tick(remaining=0)──▶  step-transition  ──▶  playing (next step)
                     │                                                       │
                     │ pause                                                  │ (last step done)
                     ▼                                                        ▼
                  paused                                                 completed → /bedtime
```

Implemented as a single Zustand slice `useSessionStore` (separate from app store — session is ephemeral, not persisted). Fields:

```ts
type Session = {
  status: 'idle' | 'playing' | 'paused' | 'completed';
  stepIndex: number;
  stepStartedAt: number | null;   // Date.now() when this step's timer began
  pausedAt: number | null;        // Date.now() when paused
  accumulatedPauseMs: number;     // total time spent paused in current step
};
```

Remaining ms for current step = `step.minutes * 60_000 - (now - stepStartedAt - accumulatedPauseMs)`.

This is drift-resistant: a single `setInterval(250ms)` reads `Date.now()` and re-derives; backgrounding the tab doesn't lose time.

### Screen layout

```
┌────────────────────────────────────────────┐
│  ✕ Close              ●●●○○○  Step 3/6     │  ← top bar (low-emphasis)
│                                            │
│                                            │
│                                            │
│              Stretch · light yoga          │  ← step title (centered)
│                                            │
│                  09:42                     │  ← big tabular countdown
│                                            │
│         ────── progress bar ──────         │  ← thin line under countdown
│                                            │
│                                            │
│        ⏸  Pause         ⏭  Skip            │  ← actions
│                                            │
│           Total: 23m left until bed        │  ← global ground-truth (small)
│                                            │
└────────────────────────────────────────────┘
```

- **Top bar**: ✕ closes the player back to home (does *not* mark the night complete). Progress dots show step index.
- **Step title**: 2xl font, low-saturation.
- **Countdown**: 6xl, tabular-nums, the page's main attention sink.
- **Progress bar**: per-step, thin, moon-500.
- **Pause / Skip**: large pill buttons, well-spaced (single-tap targets at night).
- **Total time-to-bed**: the user's actual ground truth — "yes, you can do this".

### Skip behavior

Per the original `RESEARCH.md §7` open question I flagged at P0: **Skip jumps to next step but does NOT compress total time.** Reason: the *clock* is what matters — the user needs to be in bed at bedtime. If they skip and finish early, the post-routine "Almost time…" screen runs out the remaining minutes with a soft pulse. They can tap "Lights out" anytime to dismiss.

### Special-case the breathing step

`if (/breath/i.test(step.title))` → render `<BreathingStep step={…} remaining={…} />` which puts a 4-second-inhale / 7-hold / 8-exhale pulsing circle behind the countdown. Otherwise render `<GenericStep />`.

### Wake Lock

`useWakeLock()` acquires on `status === 'playing'`, releases on `'paused' | 'completed' | unmount`. Re-acquires on `visibilitychange → visible` if still playing.

### Completion

When the final step's countdown hits zero (or all steps were skipped), navigate to `/bedtime` — the "Lights out. Goodnight." screen (P3 ships this too; it's tiny). One button: "Tap to dismiss" → routes to `/morning` for tomorrow's log prompt.

### Open question (deferring)

- Should pausing also pause the *wall clock* until-bedtime number? **No.** Wall clock is real time; pausing the routine doesn't move bedtime. Show both the step timer and the wall-clock-to-bed simultaneously and the user can decide.

---

## 7. Updated P-phase plan

| Phase | What | Status |
|---|---|---|
| P0 | Scaffold | ✅ done (commit `d5556fa`) |
| P1 | Editor + drag-sort + add/edit/delete | ✅ done (commit `3f9d7c4`) |
| **P2** | **Home polish: clock, glow, auto-dim, tomorrow label, dev-mode skip link** | next |
| **P3** | **Routine Player + Bedtime screen + WakeLock + Breathing-step micro-UI** | after P2 |
| P4 | Notifications (T-60 / T-0) + Morning streak prompt | after P3 |
| P5 | Polish + Vercel deploy + install prompt | end |

P2 is small (a couple of components + one hook); P3 is the bulk of remaining work. Both ship inline screenshots verified in the preview, as before.

---

## 8. Decisions locked in by this addendum

- ✅ Borrow Breathly's stage-machine shape, drop its loop, drop RN `Animated`, port to Framer Motion + `Date.now()` deltas.
- ✅ Mirror HeyLinda's "session → completed screen → log" lifecycle. Keep Zustand.
- ✅ Native Wake Lock API only; document NoSleep.js as v2 fallback if I ever need it.
- ✅ Skip = jump-but-keep-time (clock is ground truth).
- ✅ Breathing step gets a pulsing-circle micro-UI; everything else gets the generic step UI.
- ✅ Notifications for v1 = foreground + SW-while-alive only; no Triggers API; no Capacitor in v1.
- ✅ No audio in v1; v2 considers Pixabay CC0 loops bundled directly.

---

*Last updated: 2026-05-25*
