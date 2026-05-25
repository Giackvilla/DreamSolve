import { Link } from 'react-router-dom';

// Placeholder for P3 — full-screen guided playback lands there.
export default function Player() {
  return (
    <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center bg-night-950">
      <p className="uppercase tracking-[0.3em] text-xs text-moon-300/80 mb-6">
        Routine player
      </p>
      <p className="text-night-500 max-w-xs">
        Full-screen guided playback with per-step countdown ships in phase P3.
      </p>
      <Link to="/" className="mt-8 text-moon-300 underline">
        Back home
      </Link>
    </section>
  );
}
