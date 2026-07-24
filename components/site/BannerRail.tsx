/**
 * Signature device.
 * Echoes the vertical roll-up banners that stand behind the stage at every event,
 * so each section is announced the way the room itself is.
 */
export function BannerRail({
  label,
  tone = "ember",
}: {
  label: string;
  tone?: "ember" | "stage";
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 hidden h-full w-14 select-none lg:block"
    >
      <div className={`${tone === "ember" ? "bg-ember" : "bg-stage"} h-full w-[3px]`} />
      <span
        className="absolute left-[18px] top-10 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.42em] text-white/45"
        style={{ writingMode: "vertical-rl" }}
      >
        {label}
      </span>
    </div>
  );
}
