/** Circular score gauge (SVG). Green when passed, ember when not. */
export function ScoreGauge({
  score,
  total,
  passPct,
}: {
  score: number;
  total: number;
  passPct: number;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= passPct;
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * c;
  const stroke = passed ? "#34d399" : "#C6A24C";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" className="stroke-ink/10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            stroke={stroke}
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-semibold leading-none">{pct}%</span>
          <span className="mt-1 text-xs text-faint">
            {score}/{total}
          </span>
        </div>
      </div>
      <span
        className={`mt-4 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${
          passed ? "bg-emerald-500/15 text-emerald-400" : "bg-ember/15 text-ember"
        }`}
      >
        {passed ? "Passed" : "Keep going"}
      </span>
    </div>
  );
}
