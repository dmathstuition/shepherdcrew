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
          {pastPrograms.map((program, pi) => (
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

                {/* Photo gallery — first tile featured, the rest an even grid */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {program.images.map((img, i) => (
                    <figure
                      key={img.src}
                      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-deep ${
                        i === 0 ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""
                      }`}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        sizes={i === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
                        className={`w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.04] ${
                          i === 0 ? "aspect-[16/10] lg:h-full lg:aspect-auto" : "aspect-[3/2]"
                        }`}
                      />
                      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/10" />
                    </figure>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
