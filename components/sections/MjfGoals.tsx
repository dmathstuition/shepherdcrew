import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { mjfGoals } from "@/lib/content";

export function MjfGoals() {
  return (
    <section id="mjf-2026" className="band">
      <BannerRail label="MJF 2026" tone="stage" />
      <div className="shell">
        <Reveal>
          <Eyebrow>MJF movement &middot; Goals for 2026</Eyebrow>
          <h2 className="max-w-[20ch] font-display text-[clamp(2.2rem,5.2vw,4rem)] leading-[0.92]">
            WHAT WE ARE BUILDING THIS YEAR
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {mjfGoals.map((goal, i) => (
            <Reveal key={goal.title} delay={i * 70}>
              <div className="h-full bg-surface p-8 transition-colors duration-500 hover:bg-surface2 lg:p-10">
                <h3 className="font-display text-2xl leading-[1.05] text-gold">{goal.title}</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-muted">{goal.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
