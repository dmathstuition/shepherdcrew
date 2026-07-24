import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden pt-28">
      {/* Soft navy light from above, a whisper of gold from below — theme-aware. */}
      <div aria-hidden className="hero-aura absolute inset-0" />

      <div className="relative mx-auto w-full max-w-shell px-6 lg:px-10">
        <Reveal>
          <div className="mx-auto mb-10 grid h-28 w-28 place-items-center rounded-full bg-white shadow-coin ring-1 ring-gold/40 sm:h-32 sm:w-32">
            <Image
              src="/logo-shepherds-crew.png"
              alt="The Shepherd's Crew logo — a worshipper within a flame"
              width={248}
              height={248}
              priority
              className="h-[86%] w-[86%] object-contain"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.5em] text-gold">
            Worship &middot; Prayer &middot; Praise
          </p>
        </Reveal>

        <Reveal delay={200}>
          <h1 className="mx-auto mt-7 max-w-[16ch] text-center font-display text-[clamp(2.7rem,7vw,5.6rem)] font-semibold leading-[1.03] tracking-[-0.01em]">
            Restoring the{" "}
            <span className="italic text-gold-gradient">lost sheep</span>
          </h1>
        </Reveal>

        <Reveal delay={300}>
          <p className="mx-auto mt-8 max-w-[52ch] text-center text-base leading-relaxed text-muted sm:text-lg">
            A Christ-centred ministry raising passionate worshippers and bold witnesses — across
            campuses, communities, and nations. Established {site.established}.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#programs"
              className="w-full rounded-full bg-ember px-9 py-4 text-center text-sm font-bold tracking-wide text-midnight transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              See our programs
            </Link>
            <Link
              href="#about"
              className="w-full rounded-full border border-line/25 px-9 py-4 text-center text-sm font-bold tracking-wide text-ink transition-colors hover:border-gold hover:text-gold sm:w-auto"
            >
              Who we are
            </Link>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <div className="mt-16 flex items-center justify-center gap-4">
            <span className="h-px w-10 gold-hairline" />
            <p className="text-center text-xs uppercase tracking-[0.32em] text-faint">{site.scripture}</p>
            <span className="h-px w-10 gold-hairline" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
