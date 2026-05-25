# DreamSolve

A sleep-first PWA. Set your bedtime; one hour before, DreamSolve guides you through your personalized wind-down routine. That's it — every feature serves those two things.

## The idea

- You set a **bedtime**.
- Exactly **60 minutes before**, the app flips into routine mode and walks you through your wind-down steps one at a time, full-screen, with a countdown.
- At T-0 it says "Lights out. Goodnight." and gets out of the way.
- In the morning, one tap logs whether you finished — and a streak builds.

No sleep tracking. No content library. No social. Just bedtime.

## Status

🌙 v1 feature-complete. Personal-use PWA, runs locally / installable to phone.

| Phase | What | Status |
|---|---|---|
| P0 | Vite + React + TS + Tailwind + PWA scaffold | ✅ |
| P1 | Drag-sortable routine editor (add/edit/delete) | ✅ |
| P2 | Home countdown polish + auto-dim CSS | ✅ |
| P3 | Routine Player + Wake Lock + Bedtime screen + 4-7-8 breathing visualization | ✅ |
| P4 | T-60 / T-0 notifications + Morning streak log | ✅ |
| P5 | PWA install prompt + Vercel config | ✅ |

See [RESEARCH.md](RESEARCH.md) for the original competitive landscape, MVP cut, and tech-stack rationale, and [RESEARCH-P2-P3.md](RESEARCH-P2-P3.md) for the deeper survey of open-source repos (Breathly, HeyLinda, ai-pomo-free, StayAwake) and the locked decisions for the player screen.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build (also generates the service worker)
```

## Install on your phone

1. Open the deployed URL (or `npm run dev --host` and visit on your LAN).
2. **iOS Safari**: Share → Add to Home Screen.
3. **Android Chrome / desktop Chromium**: the in-app "Install DreamSolve" prompt appears, or use the browser menu → Install app.

Once installed, the wind-down + lights-out notifications are most reliable. The honest limitation: web platforms can't reliably schedule pings if the tab/app is fully closed — keep DreamSolve installed and open in the evening.

## Deploy to Vercel

```bash
# one-time
npm i -g vercel
vercel link

# every time
vercel --prod
```

`vercel.json` rewrites all paths to `/` (SPA), sets the service-worker cache header, and serves the manifest with the right Content-Type.

## Stack

Vite · React · TypeScript · Tailwind · Zustand · React Router · Framer Motion · `@dnd-kit/sortable` · `vite-plugin-pwa` · Lucide icons.

## Repo conventions

- **No accounts, no cloud sync.** Settings, routine, and night log live in `localStorage` (key `dreamsolve:v1`).
- **Session is ephemeral** — the routine-in-progress lives in a separate, non-persisted Zustand store so a refresh resets it cleanly.
- **Time math is drift-resistant.** Every countdown reads `Date.now()` deltas instead of counting ticks; backgrounding the tab doesn't desync.
- **Player chrome hides.** The bottom nav and install prompt are hidden on `/player` and `/bedtime`.
