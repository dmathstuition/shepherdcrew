import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden pt-28">
      {/* Column of fire — the light shaft that falls on the platform */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[-18%] h-[135%] w-[520px] -translate-x-1/2 opacity-70 blur-[70px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,194,75,0.30) 0%, rgba(242,106,33,0.22) 26%, rgba(33,72,184,0.30) 62%, rgba(7,11,30,0) 92%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 105%, rgba(33,72,184,0.42) 0%, rgba(7,11,30,0) 62%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-shell px-6 lg:px-10">
        <Reveal>
          <div className="mx-auto mb-10 w-[104px] sm:w-[124px]">
            <Image
              src="/logo-shepherds-crew.png"
              alt="The Shepherd's Crew logo — a shepherd holding a lamb inside a flame"
              width={248}
              height={248}
              priority
              className="h-auto w-full object-contain drop-shadow-[0_0_38px_rgba(242,106,33,0.55)]"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.5em] text-gold">
            Worship &middot; Prayer &middot; Praise
          </p>
        </Reveal>

        <Reveal delay={200}>
          <h1 className="mx-auto mt-6 max-w-[13ch] text-center font-display text-[clamp(3.2rem,11vw,8.5rem)] leading-[0.86] tracking-[-0.01em]">
            RESTORING
            <br />
            THE{" "}
            <span className="bg-gradient-to-b from-gold to-ember bg-clip-text text-transparent">
              LOST SHEEP
            </span>
          </h1>
        </Reveal>

        <Reveal delay={300}>
          <p className="mx-auto mt-8 max-w-[54ch] text-center text-base leading-relaxed text-white/60 sm:text-lg">
            A Christ-centred ministry raising passionate worshippers and bold witnesses — across
            campuses, communities, and nations. Established {site.established}.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#programs"
              className="w-full rounded-full bg-ember px-9 py-4 text-center font-bold text-midnight transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              See our programs
            </Link>
            <Link
              href="#about"
              className="w-full rounded-full border border-white/20 px-9 py-4 text-center font-bold text-white transition-colors hover:border-gold hover:text-gold sm:w-auto"
            >
              Who we are
            </Link>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <p className="mt-16 text-center text-xs uppercase tracking-[0.32em] text-white/30">
            {site.scripture}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
