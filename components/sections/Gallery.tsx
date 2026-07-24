import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { gallery } from "@/lib/content";

export function Gallery() {
  return (
    <section id="gallery" className="band">
      <BannerRail label="The room" tone="stage" />
      <div className="shell">
        <Reveal>
          <Eyebrow>Outpouring &middot; 8th Edition</Eyebrow>
          <h2 className="max-w-[16ch] font-display text-[clamp(2.2rem,5.2vw,4rem)] leading-[0.92]">
            THIS IS WHAT THE ROOM LOOKS LIKE
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {gallery.map((img, i) => (
            <Reveal key={img.src} delay={i * 60} className={i === 0 || i === 3 ? "col-span-2" : ""}>
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-deep">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
