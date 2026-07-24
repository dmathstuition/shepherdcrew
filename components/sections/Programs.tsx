import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { BannerRail } from "@/components/site/BannerRail";
import { Eyebrow } from "@/components/site/Eyebrow";
import { bfc } from "@/lib/content";
import { site } from "@/lib/site";

export function Programs() {
  return (
    <section id="programs" className="band">
      <BannerRail label="Our programs" />
      <div className="shell">
        <Reveal>
          <Eyebrow>Our programs</Eyebrow>
          <h2 className="max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.9]">
            THREE EXPRESSIONS,
            <br />
            ONE MANDATE
          </h2>
          <p className="mt-6 max-w-[60ch] text-white/55">
            An annual gathering, a foundational class, and a digital movement. Each one carries the
            same assignment into a different room.
          </p>
        </Reveal>

        {/* AOWAP — the flagship, given the largest treatment */}
        <Reveal delay={100}>
          <article className="group relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-night">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[300px] overflow-hidden lg:min-h-[440px]">
                <Image
                  src="/programs/outpouring-01.jpg"
                  alt="Congregation worshipping at Atmosphere of Worship and Praise"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-midnight/70 via-transparent to-night" />
                <span className="absolute left-6 top-6 rounded-full bg-ember px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-midnight">
                  8th Edition
                </span>
              </div>

              <div className="p-9 lg:p-12">
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
                  Annual gathering &middot; AOWAP
                </p>
                <h3 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[0.95]">
                  ATMOSPHERE OF
                  <br />
                  WORSHIP &amp; PRAISE
                </h3>
                <p className="mt-3 text-sm uppercase tracking-[0.28em] text-white/40">
                  Worship &middot; Revival &middot; Praise
                </p>
                <p className="mt-6 text-[17px] leading-[1.75] text-white/70">
                  A God-saturated atmosphere where worship, praise, prayer, and the Word align to
                  usher people into encounters that lead to salvation, healing, revival, and deeper
                  intimacy with God.
                </p>
                <Link
                  href="/#join"
                  className="mt-8 inline-flex items-center gap-2 font-bold text-ember transition-colors hover:text-gold"
                >
                  Be there for the next edition <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </div>
          </article>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Believers Foundational Class */}
          <Reveal delay={140}>
            <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-deep to-night p-9 lg:p-11">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
                {bfc.cohort} &middot; {bfc.length}
              </p>
              <h3 className="mt-5 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[0.96]">
                BELIEVERS
                <br />
                FOUNDATIONAL CLASS
              </h3>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-ember">
                Theme: {bfc.theme}
              </p>
              <p className="mt-6 flex-1 text-[17px] leading-[1.75] text-white/70">{bfc.intro}</p>

              <dl className="mt-8 grid grid-cols-2 gap-y-5 border-t border-white/10 pt-7 text-sm">
                <div>
                  <dt className="text-white/40">Sessions</dt>
                  <dd className="mt-1 font-semibold text-white">{bfc.sessions.join(" & ")}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Venue</dt>
                  <dd className="mt-1 font-semibold text-white">{bfc.venue}</dd>
                </div>
              </dl>

              <Link
                href="/believers-foundational-class"
                className="mt-8 inline-flex items-center gap-2 font-bold text-ember transition-colors hover:text-gold"
              >
                See the full class <span aria-hidden>&rarr;</span>
              </Link>
            </article>
          </Reveal>

          {/* MJF */}
          <Reveal delay={220}>
            <article className="flex h-full flex-col rounded-3xl border border-ember/30 bg-ember/[0.07] p-9 lg:p-11">
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
                  Digital movement
                </p>
              </div>
              <h3 className="mt-6 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[0.96]">
                MAKING JESUS
                <br />
                FAMOUS
              </h3>
              <p className="mt-6 flex-1 text-[17px] leading-[1.75] text-white/70">
                Raising teens and youths whose hearts burn for God — grounded in truth, bold in
                faith, committed to living out the gospel in every area of life, and using digital
                platforms to reach, teach, and transform lives globally.
              </p>
              <Link
                href="/#mjf-2026"
                className="mt-8 inline-flex items-center gap-2 font-bold text-ember transition-colors hover:text-gold"
              >
                See the 2026 goals <span aria-hidden>&darr;</span>
              </Link>
            </article>
          </Reveal>
        </div>

        {/* Campus Invasion — the ongoing outreach arm */}
        <Reveal delay={280}>
          <div className="mt-6 flex flex-col items-start gap-6 rounded-3xl border border-white/10 p-9 sm:flex-row sm:items-center sm:justify-between lg:p-11">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
                Ongoing outreach
              </p>
              <h3 className="mt-4 font-display text-3xl leading-none">CAMPUS INVASION</h3>
              <p className="mt-4 max-w-[62ch] text-white/65">
                Taking the Gospel directly to campuses — reaching students through worship,
                preaching, and practical evangelism.
              </p>
            </div>
            <a
              href={`tel:${site.contacts[0].phone}`}
              className="shrink-0 rounded-full border border-white/20 px-7 py-3 font-bold transition-colors hover:border-gold hover:text-gold"
            >
              Bring us to your campus
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
