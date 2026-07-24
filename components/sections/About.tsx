import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { about } from "@/lib/content";
import { site } from "@/lib/site";

export function About() {
  return (
    <section id="about" className="band">
      <BannerRail label="About us" />
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <div>
              <Eyebrow>{about.eyebrow}</Eyebrow>
              <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.92]">
                {about.headline.map((line, i) => (
                  <span key={line} className={i === about.headline.length - 1 ? "text-ember" : ""}>
                    {line}
                    {i < about.headline.length - 1 && <br />}
                  </span>
                ))}
              </h2>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="space-y-6 text-[17px] leading-[1.75] text-white/70">
              {about.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="border-l-2 border-ember pl-6 text-white/85">{about.pullquote}</p>

              <ul className="grid gap-x-8 gap-y-3 pt-6 sm:grid-cols-2">
                {site.pillars.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
