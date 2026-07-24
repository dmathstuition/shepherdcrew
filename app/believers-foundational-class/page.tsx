import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { JoinForm } from "@/components/site/JoinForm";
import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { bfc, bfcFlyers, programs } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Believers Foundational Class",
  description: `${bfc.length} of intensive teaching for new and returning believers. Theme: ${bfc.theme}.`,
};

export default function BfcPage() {
  return (
    <>
      <Nav />
      <main>
        {/* ---------------------------------------------------------- */}
        <section className="relative overflow-hidden pb-24 pt-40 lg:pb-32 lg:pt-48">
          <div aria-hidden className="hero-aura absolute inset-0" />
          <div className="relative shell">
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white ring-1 ring-gold/30">
                  <Image
                    src="/logo-mjf.png"
                    alt="Making Jesus Famous"
                    width={56}
                    height={56}
                    className="h-[86%] w-[86%] object-contain"
                  />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
                  {bfc.cohort} &middot; {bfc.length}
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mt-8 max-w-[16ch] font-display text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.88]">
                BELIEVERS
                <br />
                FOUNDATIONAL
                <br />
                <span className="text-ember">CLASS</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-8 max-w-[58ch] text-lg leading-relaxed text-muted">{bfc.intro}</p>
            </Reveal>

            <Reveal delay={260}>
              <dl className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Theme" value={bfc.theme} accent />
                <Stat label="Sessions" value={`${bfc.sessions.join(" & ")} · ${bfc.days}`} />
                <Stat label="Venue" value={bfc.venue} />
                <Stat label="Length" value={bfc.length} />
              </dl>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#enrol"
                  className="rounded-full bg-ember px-9 py-4 text-center font-bold text-midnight transition-transform hover:-translate-y-0.5"
                >
                  Enrol in this cohort
                </Link>
                <Link
                  href="/portal"
                  className="rounded-full border border-line/25 px-9 py-4 text-center font-bold transition-colors hover:border-gold hover:text-gold"
                >
                  Enter the class portal
                </Link>
              </div>
              <p className="mt-4 text-sm text-faint">
                Already enrolled? Use the access code sent to you when you joined.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        <section className="band">
          <BannerRail label="This cohort" tone="stage" />
          <div className="shell">
            <Reveal>
              <Eyebrow>What&rsquo;s on</Eyebrow>
              <h2 className="max-w-[20ch] font-display text-[clamp(2.2rem,5.2vw,4rem)] leading-[0.95]">
                THIS COHORT
              </h2>
              <p className="mt-6 max-w-[60ch] text-muted">
                Save the dates. Both run through July on WhatsApp and Telegram.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {bfcFlyers.map((flyer, i) => (
                <Reveal key={flyer.src} delay={i * 100}>
                  <figure className="group overflow-hidden rounded-3xl border border-line/15 bg-surface">
                    <div className="overflow-hidden">
                      <Image
                        src={flyer.src}
                        alt={flyer.alt}
                        width={flyer.width}
                        height={flyer.height}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="h-auto w-full transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                      />
                    </div>
                    <figcaption className="p-5">
                      <p className="font-display text-lg font-semibold italic">{flyer.label}</p>
                      <p className="mt-1 text-sm text-faint">{flyer.caption}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        <section className="band">
          <BannerRail label="Curriculum" />
          <div className="shell">
            <Reveal>
              <Eyebrow>Three weeks</Eyebrow>
              <h2 className="max-w-[20ch] font-display text-[clamp(2.2rem,5.2vw,4rem)] leading-[0.92]">
                WHAT WE COVER, IN ORDER
              </h2>
              <p className="mt-6 max-w-[60ch] text-muted">
                The order matters. Nothing in week three stands without week one underneath it.
              </p>
            </Reveal>

            <ol className="mt-14 space-y-6">
              {bfc.weeks.map((week, i) => (
                <Reveal key={week.label} delay={i * 90}>
                  <li className="grid gap-8 rounded-3xl border border-line/15 bg-gradient-to-br from-surface to-surface2 p-9 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
                    <div>
                      <p className="font-display text-5xl leading-none text-ember/60">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
                        {week.label}
                      </p>
                      <h3 className="mt-3 font-display text-3xl leading-[1.05] lg:text-4xl">
                        {week.title}
                      </h3>
                    </div>
                    <ul className="space-y-4 border-t border-line/15 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                      {week.topics.map((topic) => (
                        <li key={topic} className="flex gap-4 text-[17px] leading-[1.6] text-muted">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </li>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={250}>
              <p className="mt-10 text-center font-display text-xl italic leading-relaxed text-muted lg:text-2xl">
                {bfc.progression}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-8 rounded-3xl border border-ember/30 bg-ember/[0.07] p-9 lg:p-12">
                <Eyebrow>Assessment</Eyebrow>
                <h3 className="font-display text-2xl leading-[1.1] lg:text-3xl">
                  {bfc.assessment.title}
                </h3>
                <p className="mt-5 max-w-[70ch] text-[17px] leading-[1.75] text-muted">
                  {bfc.assessment.body}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        <section className="band">
          <BannerRail label="Who it&rsquo;s for" tone="stage" />
          <div className="shell">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <Reveal>
                <div>
                  <Eyebrow>Who it&rsquo;s for</Eyebrow>
                  <h2 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.92]">
                    COME AS YOU
                    <br />
                    ARE. LEAVE
                    <br />
                    <span className="text-ember">GROUNDED.</span>
                  </h2>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <ul className="space-y-6">
                  {[
                    "You gave your life to Christ recently and want to know what happens next.",
                    "You have been in church for years but were never taught the foundations.",
                    "You are back after a season away and want to rebuild properly.",
                    "You lead others and want a clean framework to disciple them with.",
                  ].map((line) => (
                    <li
                      key={line}
                      className="border-b border-line/15 pb-6 text-[17px] leading-[1.7] text-muted last:border-0"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        <section id="enrol" className="band">
          <div className="shell">
            <Reveal>
              <div className="rounded-3xl border border-line/15 p-9 text-center lg:p-14">
                <Eyebrow>Registration</Eyebrow>
                <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[0.94]">
                  TALK TO THE TEAM
                </h2>
                <p className="mx-auto mt-6 max-w-[52ch] text-muted">
                  Send your details below, or reach either coordinator directly.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  {site.contacts.map((c) => (
                    <a
                      key={c.phone}
                      href={`tel:${c.phone}`}
                      className="rounded-full border border-line/25 px-7 py-3 font-bold transition-colors hover:border-gold hover:text-gold"
                    >
                      {c.name} &middot; {c.phone}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <JoinForm defaultProgram={programs[1]} />
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-7 ${accent ? "bg-ember/10" : "bg-surface"}`}>
      <dt className="text-[11px] font-bold uppercase tracking-[0.3em] text-faint">{label}</dt>
      <dd className={`mt-3 font-display text-xl leading-tight ${accent ? "text-gold" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
