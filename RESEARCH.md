# DreamSolve — Research & Plan

> A sleep-first app. The user sets a target **bedtime**. One hour before, the app starts a personalized **bedtime routine**. That's it — every other feature exists to serve those two things.

---

## 1. Competitive landscape

| App | What's relevant to us | What we'd steal | What we'd skip |
|---|---|---|---|
| **RISE Science** | Predicts circadian "wind-down window", reminds you when to start it. 20+ sleep-hygiene habit nudges. | The single nightly "start winding down now" moment — the strongest signal in the category. | The sleep-debt + circadian science layer (out of scope for v1). |
| **Calm — Bedtime reminders** | Pick hour + minute + days-of-week; one push notification. | Day-of-week scheduling; simple settings UI. | The content library (meditations, stories). |
| **Hatch Restore** | Companion app to a bedside lamp; "time to put the phone down" nudge. | The framing — *the routine starts when the phone gets put down*, not when content starts playing. | Hardware. |
| **Headspace Sleep / BetterSleep** | Wind-down meditations, sleepcasts, soundscapes. | Optional ambient sound during routine steps. | Huge content catalog. |
| **Sleep Cycle** | Sleep tracking + smart alarm; bedtime reminder is secondary. | Smart-alarm wake window (later). | The whole tracking-via-microphone layer (privacy-heavy, distracts from focus). |
| **Apple Sleep Focus / Android Wind Down** | OS-level: actually dims screen, silences notifications at the trigger time. | A v2 idea: integrate with OS Focus instead of fighting it. | — |
| **Lune** | Personalized "sleep ritual" — a sequence of steps. | The sequence-of-steps model (what we're already building). | Heavy onboarding. |
| **Routinery / habit-tracker apps** | Timed step-by-step routines with countdowns. | The "timed checklist that auto-advances" UX. | General-purpose routine builder; we're sleep-only. |

**The clearest gap:** most apps either (a) ping you once and disappear, or (b) bury bedtime under a giant wellness suite. Nothing is a focused, 60-minute *guided* wind-down that's actually opinionated about *what* you do in that hour. That's our wedge.

---

## 2. UX & visual patterns to adopt

From the case studies (Tubik Slumber, Sheeply, Nukkua, Ramotion, Dribbble sleep-app collections):

- **Dark theme by default**, with a single soft accent (indigo/lavender or warm amber). Bright UI at bedtime is a self-inflicted wound.
- **Big, low-information screens.** One number, one action. Sleep apps that look like dashboards fail at night.
- **Round/soft shapes, generous spacing.** No sharp dashboard-y cards.
- **Auto-dimming UI** as bedtime approaches (brightness + warmth shift over the wind-down hour). Several apps do this; it works.
- **Smooth animation on transitions** between routine steps — not flashy, just enough to feel calm.
- **Minimal text input.** Steppers, pickers, toggles. Typing at 10pm is friction.

---

## 3. MVP feature set (v1)

The cut is aggressive on purpose. Everything else is v2+.

### Core (must ship)
1. **Set bedtime** — single time-picker. Optional per-day-of-week override.
2. **Wind-down trigger** — exactly 1 hour before bedtime, the app's home screen flips into "routine mode."
3. **Bedtime routine builder** — ordered list of steps, each with a duration. Sum of durations ≤ 60 min. Drag to reorder, tap to edit, swipe to delete. Defaults seeded so a new user has a working routine immediately.
4. **Guided routine playback** — full-screen, one step at a time, big countdown, "done / skip" buttons, auto-advance.
5. **Bedtime moment** — when the routine ends, a single screen: "Lights out. Goodnight." No more interaction.
6. **Local notification** at T-60 ("wind down starts now") and at T-0 ("lights out").
7. **Streak / last-night log** — did you complete the routine? One tap in the morning. Lightweight history.

### Defaults to seed (so empty-state isn't empty)
A reasonable 60-min routine, derived from Sleep Foundation / Headspace / RISE guidance:
- 60→50 — Tidy / set out tomorrow's clothes (10m)
- 50→45 — Dim lights, put phone on charger across the room (5m)
- 45→30 — Shower or wash face + skincare (15m)
- 30→20 — Stretch / light yoga (10m)
- 20→10 — Read on paper / journal (10m)
- 10→0 — Breathing exercise (4-7-8 × 4 rounds) (10m)

User can wipe and replace, but the empty state is a working routine, not a blank slate.

### Explicitly out of scope for v1
- Sleep tracking via mic/accelerometer
- Smart alarm / wake-up window
- Audio library (meditations, soundscapes) — maybe one looping ambient track per step in v2
- Social / sharing
- Accounts + cloud sync — v1 is local-only (`localStorage` / IndexedDB)
- AI-personalized routines — v2, once we have streak data

---

## 4. Screen map

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [ Home / Countdown ]                                       │
│      Big clock: "5h 23m until wind-down"                    │
│      Bedtime: 22:30 (tap to edit)                           │
│      Tonight's routine: 6 steps · 60 min (tap to edit)      │
│                                                             │
│      ── when within wind-down hour ──                       │
│      Flips to → [ Routine Player ]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [ Routine Player ]   (full screen, dimmed UI)              │
│      Step 3 of 6 · "Stretch"                                │
│      ◯ ◯ ● ◯ ◯ ◯                                            │
│      ⏱  09:42 remaining                                     │
│      [ Done ]    [ Skip ]                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [ Routine Editor ]                                         │
│      Drag-sortable list of steps                            │
│      + Add step (title, minutes, optional icon)             │
│      Bar at top: 58 / 60 min                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [ Bedtime Settings ]                                       │
│      Bedtime: 22:30                                         │
│      Per-day override toggle                                │
│      Wind-down lead: 60 min (10–90 slider, v2)              │
│      Notifications on/off                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [ Morning Log ]   (shown first open after bedtime)         │
│      "Did you finish last night's routine?"  Yes / No       │
│      Streak: 4 nights 🌙                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Only **five** screens. Anything that doesn't fit in one of them is out of scope.

---

## 5. Tech stack & implementation

Chosen: **Web PWA** (decision recorded with user).

| Concern | Choice | Why |
|---|---|---|
| Framework | **Vite + React + TypeScript** | Fast dev loop, easy PWA setup, broad familiarity. |
| Styling | **Tailwind CSS** + CSS variables for theme | Dark theme + auto-dimming via CSS vars is trivial. |
| State | **Zustand** | Small, no boilerplate. Routine state + timer is all we need. |
| Routing | **React Router** | 5 screens, lightweight. |
| Persistence | **`localStorage`** for settings + routine; **IndexedDB** (via `idb-keyval`) for nightly log history | No backend in v1. |
| PWA | **`vite-plugin-pwa`** (Workbox) | Installable, offline-capable, manifest auto-generated. |
| Notifications | **Web Notifications API** + **Service Worker `showNotification`** scheduled via `setTimeout` on app open, plus a periodic-sync fallback on supported browsers | The honest caveat: web push for *scheduled* local notifications is unreliable when the tab is closed. We document this as a known v1 limitation and recommend "Add to Home Screen" + keep PWA installed. v2: native wrapper (Capacitor) for real local notifications. |
| Time / scheduling | **`date-fns`** | Tiny, tree-shakeable. |
| Animation | **Framer Motion** | Step transitions, countdown polish. |
| Icons | **Lucide** | Clean, fits dark UI. |
| Testing | **Vitest** + **React Testing Library** | Stack-native. |
| Lint/format | **ESLint** + **Prettier** | Standard. |
| Deploy | **Vercel** (later) | Free, PWA-friendly. |

### Key implementation notes
- **Wind-down detection**: a single `useEffect` polling `Date.now()` every 30s, comparing to `bedtime - 60min`. When crossed, route flips to `/player`. Simple and reliable.
- **Routine player timer**: one `setInterval` driven by `Date.now()` deltas (not tick counting) so it survives tab backgrounding.
- **Auto-dimming**: CSS variables `--ui-brightness` and `--ui-warmth` interpolated based on minutes-to-bedtime; applied via `filter: brightness() sepia()` on the root.
- **Service worker** registers a notification 60 min before bedtime each day, refreshed on app open. Documented limitation if PWA isn't installed.

---

## 6. Build phases

| Phase | Deliverable |
|---|---|
| **P0 — Scaffold** | Vite + React + TS + Tailwind + PWA plugin. Routing skeleton. Dark theme. Zustand store with persisted bedtime + routine. |
| **P1 — Settings + Routine editor** | Bedtime picker. Drag-sortable step list. Defaults seeded. Total-minutes guard (≤60). |
| **P2 — Home countdown** | Big countdown to wind-down. Tap-through to edit bedtime / routine. |
| **P3 — Routine player** | Full-screen guided playback. Auto-advance. Done / Skip. End-of-routine "Lights out" screen. |
| **P4 — Notifications + Morning log** | Service-worker scheduled notification. Morning streak prompt. |
| **P5 — Polish** | Auto-dim UI. Animations. PWA install prompt. Deploy to Vercel. |

Each phase is shippable on its own.

---

## 7. Open questions for later

- Per-day-of-week bedtime — v1 or v2? (Leaning v1, single toggle for "weekends different".)
- Should "Skip" in the player shorten the routine, or just jump to the next step keeping total time? (Leaning: jump, keep total — the *time* matters more than the steps.)
- Do we let the user *extend* past 60 minutes? (No. The constraint is the product.)

---

*Last updated: 2026-05-25*
