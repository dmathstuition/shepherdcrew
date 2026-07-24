import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { visioneer } from "@/lib/content";

export function Visioneer() {
  return (
    <section id="visioneer" className="band">
      <BannerRail label="The visioneer" tone="stage" />
      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <figure className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-line/15 bg-surface">
              <Image
                src={visioneer.image}
                alt={`${visioneer.name}, ${visioneer.role}`}
                width={1023}
                height={978}
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/15" />
            </figure>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <Eyebrow>The visioneer</Eyebrow>
              <h2 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
                {visioneer.name}
              </h2>
              <p className="mt-3 text-sm uppercase tracking-[0.28em] text-gold">{visioneer.role}</p>

              <div className="mt-7 space-y-5">
                {visioneer.bio.map((para, i) => (
                  <p key={i} className="text-[17px] leading-[1.8] text-muted">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
