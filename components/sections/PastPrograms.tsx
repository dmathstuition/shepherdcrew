import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { pastPrograms } from "@/lib/content";

export function PastPrograms() {
  return (
    <section id="past-programs" className="band">
      <BannerRail label="Past programs" tone="stage" />
      <div className="shell">
        <Reveal>
          <Eyebrow>From the archives</Eyebrow>
          <h2 className="max-w-[18ch] font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-semibold leading-[1.02]">
            Programs we have held
          </h2>
          <p className="mt-6 max-w-[58ch] text-mist/55">
            A look back at the gatherings God has used to restore, revive, and raise a generation.
          </p>
        </Reveal>

        <div className="mt-16 space-y-20">
          {pastPrograms.map((program, pi) => {
            const [lead, ...rest] = program.images;
            return (
              <Reveal key={program.name} delay={pi * 80}>
                <article>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
                        {program.year}
                      </p>
                      <h3 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold italic leading-none">
                        {program.name}
                      </h3>
                      <p className="mt-3 text-sm uppercase tracking-[0.24em] text-mist/45">
                        {program.edition}
                      </p>
                    </div>
                    <p className="max-w-[42ch] text-mist/60">{program.blurb}</p>
                  </div>

                  <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <figure className="group relative overflow-hidden rounded-3xl border border-white/10 bg-deep">
                      <Image
                        src={lead.src}
                        alt={lead.alt}
                        width={lead.width}
                        height={lead.height}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="h-full max-h-[520px] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.03]"
                      />
                      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/10" />
                    </figure>

                    <div className="grid gap-4">
                      {rest.map((img) => (
                        <figure
                          key={img.src}
                          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-deep"
                        >
                          <Image
                            src={img.src}
                            alt={img.alt}
                            width={img.width}
                            height={img.height}
                            sizes="(max-width: 1024px) 100vw, 38vw"
                            className="h-full max-h-[520px] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.03]"
                          />
                          <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/10" />
                        </figure>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
