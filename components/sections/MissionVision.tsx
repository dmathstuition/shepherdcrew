import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { mandate, mission, vision } from "@/lib/content";

export function MissionVision() {
  return (
    <section className="band">
      <BannerRail label="Mission &amp; vision" tone="stage" />
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="h-full rounded-3xl border border-line/15 bg-gradient-to-br from-surface to-surface2 p-9 lg:p-12">
              <Eyebrow>Mission</Eyebrow>
              <p className="font-display text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.12] text-ink">
                {mission}
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="h-full rounded-3xl border border-ember/30 bg-ember/[0.07] p-9 lg:p-12">
              <Eyebrow>Vision</Eyebrow>
              <p className="text-[17px] leading-[1.75] text-muted">{vision}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="mt-6 rounded-3xl border border-line/15 p-9 lg:p-12">
            <Eyebrow>Core mandate</Eyebrow>
            <div className="grid gap-y-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
              {mandate.map((m) => (
                <p key={m} className="font-display text-xl leading-[1.15] text-ink lg:text-2xl">
                  {m}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
