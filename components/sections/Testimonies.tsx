import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { testimonies } from "@/lib/content";

export function Testimonies() {
  return (
    <section id="testimonies" className="band">
      <BannerRail label="Testimonies" tone="ember" />
      <div className="shell">
        <Reveal>
          <Eyebrow>In their own words</Eyebrow>
          <h2 className="max-w-[18ch] font-display text-[clamp(2.2rem,5.2vw,4rem)] leading-[0.92]">
            WHAT GOD DID IN THE ROOM
          </h2>
          <p className="mt-5 max-w-[54ch] text-muted">
            Unedited messages from those who were in the room at Outpouring 2025.
          </p>
        </Reveal>

        {/* Masonry via CSS columns — screenshots keep their natural aspect ratio */}
        <div className="mt-14 gap-4 sm:gap-5 [column-count:1] sm:[column-count:2]">
          {testimonies.map((t, i) => (
            <Reveal key={t.src} delay={i * 80} className="mb-4 break-inside-avoid sm:mb-5">
              <figure className="overflow-hidden rounded-2xl border border-line/15 bg-surface">
                <Image
                  src={t.src}
                  alt={`Testimony from ${t.caption}: “${t.quote}”`}
                  width={t.width}
                  height={t.height}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="h-auto w-full"
                />
                <figcaption className="flex items-center gap-2 px-5 py-4 text-xs uppercase tracking-[0.28em] text-faint">
                  <span className="h-[2px] w-6 bg-ember" />
                  {t.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
