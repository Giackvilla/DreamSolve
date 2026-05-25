import { useAppStore } from '@/store/useAppStore';

export default function MorningLog() {
  const log = useAppStore((s) => s.log);

  const streak = (() => {
    let count = 0;
    const sorted = [...log].sort((a, b) => (a.date < b.date ? 1 : -1));
    for (const e of sorted) {
      if (e.completed) count++;
      else break;
    }
    return count;
  })();

  return (
    <section className="px-6 pt-12 max-w-md mx-auto">
      <h1 className="text-2xl font-light mb-1">Morning</h1>
      <p className="text-sm text-night-500 mb-6">Last night's routine</p>

      <div className="rounded-2xl bg-night-800/70 border border-night-700 p-6 text-center">
        <div className="text-5xl font-light tabular-nums">{streak}</div>
        <div className="text-sm text-night-500 mt-1">night streak</div>
      </div>

      <p className="text-xs text-night-500 mt-6">
        Morning check-in prompt and history view arrive in phase P4.
      </p>
    </section>
  );
}
