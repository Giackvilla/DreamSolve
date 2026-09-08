# DreamSolve

A sleep-first PWA. Set your bedtime; one hour before, DreamSolve guides you through your personalized wind-down routine. That's it — every feature serves those two things.

> Live: **https://dreamsolve-dun.vercel.app** · Single-user, personal-use app.

## The idea

- You set a **bedtime**.
- Exactly **60 minutes before**, the app flips into routine mode and walks you through your wind-down steps one at a time, full-screen, with a countdown.
- At T-0 it says "Lights out. Goodnight." and gets out of the way.
- In the morning, one tap logs whether you finished — and a streak builds.

No sleep tracking. No content library. No social. Just bedtime.

## Status

🌙 **v2 in progress.** v1 shipped feature-complete. v2 turns DreamSolve from a guided *timer* into a guided *practice*.

| Phase | What | Status |
|---|---|---|
| P0–P5 | Scaffold → Editor → Player → Notifications → PWA + Deploy | ✅ |
| V2.1 | Step-type refactor (discriminated `practice` payload) | ✅ |
| V2.2 | Cognitive Shuffle (random-word visualizer) | ✅ |
| V2.4 | Constructive Worry + Tomorrow's to-do (input forms, IDB-persisted) + Rewind + Morning undo | ✅ |
| V2.5 | Cyclic Sighing + Coherent breathing | next |
| Future | Whoop-fed morning rating · PMR · Ambient sound · Stretch SVGs | parked, see [FUTURE.md](FUTURE.md) |

### Guided practices included

| Step type | What happens on screen | Evidence |
|---|---|---|
| Generic countdown | Big timer + step icon + step title. The v1 default. | — |
| **Breathing** (`4-7-8`) | Pulsing radial-gradient circle synced to inhale-hold-exhale. | 4-7-8 protocol |
| **Cognitive Shuffle** | One neutral noun every 8 s, slow crossfade. | [Beaudoin 2016 SDIT](https://www.researchgate.net/publication/300004607) |
| **Constructive Worry** | Two-column rows: worry → smallest next step. IDB-saved per night. | [Carney worksheet](https://drcolleencarney.com/wp-content/uploads/2013/05/Constructive-Worry-Worksheet.pdf), [Jansson-Fröjmark 2012 RCT](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/j.2044-8260.2011.02018.x) |
| **Tomorrow's to-do** | Three-bullet list (add more if you need). IDB-saved per night. | [Scullin 2018 PSG RCT](https://pmc.ncbi.nlm.nih.gov/articles/PMC5758411/) |

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build (also generates the service worker)
npm run typecheck
```

## Install on your phone

1. Open the deployed URL.
2. **iOS Safari**: Share → Add to Home Screen.
3. **Android Chrome / desktop Chromium**: the in-app "Install DreamSolve" banner appears, or use the browser menu → Install app.

Once installed, the wind-down + lights-out notifications are most reliable. **Honest limitation**: web platforms can't reliably schedule pings if the tab/app is fully closed — keep DreamSolve installed and open in the evening. Whoop integration (#6 in FUTURE) will replace the subjective rating with real biometric data.

## Deploy

Pushes to `main` auto-deploy via the linked Vercel project at `giackvillas-projects/dreamsolve`. Canonical URL: `https://dreamsolve-dun.vercel.app`. To deploy manually:

```bash
vercel --prod
```

`vercel.json` rewrites all paths to `/` (SPA), sets cache headers on the service worker, and serves the manifest with the right Content-Type.

## Stack

Vite · React 18 · TypeScript · Tailwind · Zustand · React Router · Framer Motion · `@dnd-kit/sortable` · `idb-keyval` (per-night input persistence) · `vite-plugin-pwa` · Lucide icons.

## Repo conventions

- **No accounts, no cloud sync.** Settings, routine, and night log live in `localStorage` (key `dreamsolve:v1`). Per-night input (worry / to-do) lives in IndexedDB under `dreamsolve:input:<nightDate>:<preset>`.
- **Session is ephemeral.** The routine-in-progress lives in a separate, non-persisted Zustand store so a refresh resets it cleanly.
- **Time math is drift-resistant.** Every countdown reads `Date.now()` deltas instead of counting ticks; backgrounding the tab doesn't desync.
- **Player chrome hides.** The bottom nav, install prompt, and onscreen keyboard nudges are all hidden on `/player` and `/bedtime`, and the bottom nav also hides whenever any text input is focused so the iOS keyboard doesn't shove the nav up.
- **Auto-dim filter** is on `.dimmable` (the `<main>` wrapper) — never on `#root`. Putting `filter` on `#root` would make it the containing block for fixed-position children and break the nav.

## Documents

- [RESEARCH.md](RESEARCH.md) — initial competitive landscape, MVP cut, tech-stack rationale (v1).
- [RESEARCH-P2-P3.md](RESEARCH-P2-P3.md) — survey of open-source repos (Breathly, HeyLinda, ai-pomo-free, StayAwake) and locked decisions for the player.
- [FUTURE.md](FUTURE.md) — v2 roadmap, Whoop integration plan, explicit rejections.

## License

MIT — see [LICENSE](LICENSE).
