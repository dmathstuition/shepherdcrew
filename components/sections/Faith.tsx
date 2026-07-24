import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { faith } from "@/lib/content";

export function Faith() {
  return (
    <section id="beliefs" className="band">
      <BannerRail label="Statement of faith" />
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <Eyebrow>Statement of faith</Eyebrow>
              <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.92]">
                WHAT WE
                <br />
                BELIEVE
              </h2>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ul>
              {faith.map((line, i) => (
                <li
                  key={line}
                  className="flex gap-6 border-b border-white/10 py-7 first:border-t first:border-white/10"
                >
                  <span className="mt-1 shrink-0 font-display text-sm text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[17px] leading-[1.7] text-white/75">{line}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
