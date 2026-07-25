export function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-gold/40 bg-gold/[0.06]" : "border-line/15 bg-surface"}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-faint">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold leading-none ${accent ? "text-gold" : "text-ink"}`}>
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-faint">{sub}</p>}
    </div>
  );
}
